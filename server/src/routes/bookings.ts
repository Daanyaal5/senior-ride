import { Router, Request, Response } from "express";
import crypto from "crypto";
import { calculateFare, cleanHours, ContactUsError, priceList, Place } from "../services/fare.js";
import { EXTRA_CARE_PER_HOUR, URGENT_FEE, WAIT_FEE_PER_30_MIN } from "../config/pricing.js";
import { chargeAndSaveCard } from "../services/square.js";
import { Booking, emailBusiness, emailCustomer } from "../services/bookingEmails.js";
import { bookingLimiter } from "../middleware/rateLimit.js";

const router = Router();

const EMAIL = /^\S+@\S+\.\S+$/;
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const last10 = (v: unknown) => digits(v).slice(-10);
const text = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const isPlace = (p: any): p is Place =>
  p && typeof p.address === "string" && typeof p.lat === "number" && typeof p.lng === "number";

/** Short booking code such as "HAM-7K3Q9P". Letters that look alike (0/O, 1/I) are left out. */
function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "HAM-" + Array.from(crypto.randomBytes(6), (b) => chars[b % chars.length]).join("");
}

/** Shows a date the way people in Halifax read it, e.g. "Saturday, October 24, 2026 at 9:00 a.m." */
const halifaxTime = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", { timeZone: "America/Halifax", dateStyle: "full", timeStyle: "short" });

// GET /api/bookings/prices: the price list for the home page.
router.get("/prices", (_req: Request, res: Response) => {
  res.json({ prices: priceList(), extraCarePerHour: EXTRA_CARE_PER_HOUR, urgentFee: URGENT_FEE, waitFeePer30: WAIT_FEE_PER_30_MIN });
});

// POST /api/bookings/estimate: the price shown on the form while the customer fills it in.
router.post("/estimate", (req: Request, res: Response) => {
  const { pickup, dropoff } = req.body;
  if (!isPlace(pickup) || !isPlace(dropoff)) return res.status(400).json({ error: "Please choose a pickup and a drop-off." });
  try {
    res.json({ fare: calculateFare(pickup, dropoff, cleanHours(req.body.extraCareHours), req.body.urgent === true) });
  } catch (e) {
    if (e instanceof ContactUsError) return res.status(400).json({ error: e.message, contactUs: true });
    res.status(500).json({ error: "We could not work out the price. Please contact us." });
  }
});

// POST /api/bookings: checks the booking, takes the card or Apple Pay payment (or records e-Transfer or cash), and emails everyone.
router.post("/", bookingLimiter, async (req: Request, res: Response) => {
  const b = req.body;

  // 1. Check what the customer sent. Every message tells them exactly what to fix.
  const name = text(b.name, 100), email = text(b.email, 150), phone = text(b.phone, 30), familyPhone = text(b.familyPhone, 30);
  if (!name) return res.status(400).json({ error: "Please enter your full name." });
  if (last10(phone).length < 10) return res.status(400).json({ error: "Please enter a 10-digit phone number." });
  if (!EMAIL.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (familyPhone && last10(familyPhone) === last10(phone)) {
    return res.status(400).json({ error: "The family contact number must be different from your own." });
  }
  if (!isPlace(b.pickup) || !isPlace(b.dropoff)) return res.status(400).json({ error: "Please choose a pickup and a drop-off." });
  const when = new Date(b.scheduledTime);
  if (isNaN(when.getTime()) || when.getTime() < Date.now()) return res.status(400).json({ error: "Please choose a date and time in the future." });
  if (!["card", "applepay", "etransfer", "cash"].includes(b.payment)) return res.status(400).json({ error: "Please choose how you will pay." });
  if (b.agree !== true) return res.status(400).json({ error: "Please tick the box to accept our booking policy." });

  // 2. Work out the price on the server, so nobody can change it in their browser.
  let fare;
  try {
    fare = calculateFare(b.pickup, b.dropoff, cleanHours(b.extraCareHours), b.urgent === true);
  } catch (e) {
    if (e instanceof ContactUsError) return res.status(400).json({ error: e.message, contactUs: true });
    return res.status(500).json({ error: "We could not work out the price. Please contact us." });
  }

  const booking: Booking = {
    reference: makeReference(),
    name, phone, familyPhone, email,
    pickup: b.pickup, dropoff: b.dropoff,
    when: halifaxTime(b.scheduledTime),
    flightNumber: text(b.flightNumber, 20), language: text(b.language, 40) || "English",
    notes: text(b.notes, 500), payment: b.payment, fare,
  };

  // 3a. Card or Apple Pay: charge first. If it fails, nothing is booked and the customer can try again.
  if (booking.payment === "card" || booking.payment === "applepay") {
    if (!b.token) return res.status(400).json({ error: "Please enter your card details." });
    try {
      await chargeAndSaveCard({
        reference: booking.reference, amount: fare.total, token: String(b.token), name, email,
        saveCard: booking.payment === "card", // Square cannot save Apple Pay cards
        note: `${booking.reference} | ${booking.when} | ${booking.pickup.address} -> ${booking.dropoff.address} | ${name} ${phone}`,
      });
    } catch (e) {
      console.error(`Card payment failed for ${booking.reference}:`, (e as Error).message);
      const reason = process.env.DEBUG_ERRORS === "true" ? ` (Reason: ${(e as Error).message})` : "";
      return res.status(402).json({ error: "Your card was not charged. Please check the card details and try again, or contact us." + reason });
    }
    // The payment went through, so a failed email must not show an error. It is logged, and the booking is in Square.
    await emailBusiness(booking).catch((e) => console.error(`Business email failed for ${booking.reference}:`, e.message));
    await emailCustomer(booking).catch((e) => console.error(`Customer email failed for ${booking.reference}:`, e.message));
    return res.status(201).json({ reference: booking.reference, fare, payment: booking.payment });
  }

  // 3b. e-Transfer or cash: the business email IS the booking, so it must arrive.
  try {
    await emailBusiness(booking);
  } catch (e) {
    console.error(`Business email failed for ${booking.reference}:`, (e as Error).message);
    return res.status(502).json({ error: "We could not save your booking. Please call, text or WhatsApp us to book." });
  }
  await emailCustomer(booking).catch((e) => console.error(`Customer email failed for ${booking.reference}:`, e.message));
  res.status(201).json({ reference: booking.reference, fare, payment: booking.payment });
});

export default router;