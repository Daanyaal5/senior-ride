import { Router, Request, Response } from "express";
import { getRouteInfo } from "../services/maps.js";
import { calculateFare } from "../services/fare.js";
import { createBooking, listBookings } from "../db/bookingsRepo.js";

const router = Router();

const isPlace = (p: any) =>
  p && typeof p.address === "string" && typeof p.lat === "number" && typeof p.lng === "number";

/** Works out distance, time and fare for a request body. Shared by both endpoints below. */
async function estimate(body: any) {
  const route = await getRouteInfo(body.pickup, body.dropoff);
  const fare = calculateFare({
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    extraCare: !!body.extraCare,
    asap: !!body.asap,
  });
  return { route, fare };
}

// POST /api/bookings/estimate: live fare shown on the form before booking.
router.post("/estimate", async (req: Request, res: Response) => {
  if (!isPlace(req.body.pickup) || !isPlace(req.body.dropoff)) {
    return res.status(400).json({ error: "Please choose a pickup and a destination." });
  }
  try {
    const { route, fare } = await estimate(req.body);
    res.json({ ...route, fare });
  } catch {
    res.status(502).json({ error: "We could not work out the route. Please try again." });
  }
});

// POST /api/bookings: validates, recalculates the fare on the server, saves the booking.
router.post("/", async (req: Request, res: Response) => {
  const b = req.body;
  const missing = ["name", "phone", "secondaryPhone", "email", "preferredLanguage"].filter(
    (k) => !b[k] || typeof b[k] !== "string" || !b[k].trim()
  );
  if (missing.length) return res.status(400).json({ error: `Please fill in: ${missing.join(", ")}.` });
  if (!isPlace(b.pickup) || !isPlace(b.dropoff)) {
    return res.status(400).json({ error: "Please choose a pickup and a destination." });
  }
  if (!b.asap && !b.scheduledTime) {
    return res.status(400).json({ error: "Please choose a date and time, or select ASAP." });
  }

  try {
    // The fare is recalculated here, so the browser can never set its own price.
    const { fare } = await estimate(b);
    const reference = await createBooking({
      name: b.name.trim(), phone: b.phone.trim(), secondaryPhone: b.secondaryPhone.trim(),
      email: b.email.trim(), pickup: b.pickup, dropoff: b.dropoff,
      asap: !!b.asap, scheduledTime: b.asap ? null : b.scheduledTime,
      extraCare: !!b.extraCare, preferredLanguage: b.preferredLanguage, estimatedFare: fare.total,
    });
    res.status(201).json({ reference, fare });
  } catch {
    res.status(500).json({ error: "Something went wrong saving your booking. Please call us to book." });
  }
});

// GET /api/bookings: your bookings list. Protected by the ADMIN_KEY header.
router.get("/", async (req: Request, res: Response) => {
  if (req.header("x-admin-key") !== process.env.ADMIN_KEY) return res.status(401).json({ error: "Not allowed" });
  res.json(await listBookings());
});

export default router;
