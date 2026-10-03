import { pool } from "./pool.js";

export interface NewBooking {
  name: string; phone: string; secondaryPhone: string; email: string;
  pickup: { address: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
  asap: boolean; scheduledTime: string | null;
  extraCare: boolean; preferredLanguage: string; estimatedFare: number;
}

// Makes a short reference such as "TXI-48213" for the customer to quote on the phone.
const makeReference = () => `TXI-${Math.floor(10000 + Math.random() * 90000)}`;

/** Saves one booking and returns its reference number. */
export async function createBooking(b: NewBooking): Promise<string> {
  const reference = makeReference();
  await pool.query(
    `INSERT INTO bookings (reference, name, phone, secondary_phone, email,
       pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng,
       is_asap, scheduled_time, extra_care, preferred_language, estimated_fare)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [reference, b.name, b.phone, b.secondaryPhone, b.email,
     b.pickup.address, b.pickup.lat, b.pickup.lng, b.dropoff.address, b.dropoff.lat, b.dropoff.lng,
     b.asap, b.scheduledTime, b.extraCare, b.preferredLanguage, b.estimatedFare]
  );
  return reference;
}

/** Returns all bookings, newest first (used by the admin list). */
export async function listBookings() {
  const { rows } = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");
  return rows;
}

/** Marks a booking as paid (called when Stripe confirms the payment). */
export async function markPaid(reference: string) {
  await pool.query("UPDATE bookings SET payment_status = 'paid' WHERE reference = $1", [reference]);
}
