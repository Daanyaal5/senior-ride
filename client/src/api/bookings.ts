import { FareBreakdown, PaymentMethod, Place } from "../types";

// The data the booking form sends to the server.
export interface BookingRequest {
  name: string; phone: string; familyPhone: string; email: string;
  pickup: Place; dropoff: Place;
  scheduledTime: string;          // ISO date and time
  flightNumber: string; language: string; notes: string;
  extraCareHours: number;         // 0 = no Extra Care
  urgent: boolean;                // same-day or short-notice ride (extra fee)
  payment: PaymentMethod;
  token?: string;                 // from the Square card form or Apple Pay
  agree: boolean;
}

/** An error from the server. contactUs = the trip has no online price (long distance). */
export class ApiError extends Error {
  constructor(message: string, public contactUs = false) { super(message); }
}

/** Small helper: sends JSON and throws the server's own message if something fails. */
async function request<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong. Please contact us.", !!data.contactUs);
  return data as T;
}

/** The price for a trip, shown while the form is filled in. */
export const getEstimate = (pickup: Place, dropoff: Place, extraCareHours: number, urgent: boolean) =>
  request<{ fare: FareBreakdown }>("/api/bookings/estimate", { pickup, dropoff, extraCareHours, urgent });

/** Sends the booking. For card payments this also charges the card. */
export const submitBooking = (b: BookingRequest) =>
  request<{ reference: string; fare: FareBreakdown; payment: PaymentMethod }>("/api/bookings", b);

/** The price list for the home page. */
export const getPrices = () =>
  request<{ prices: { route: string; price: number }[]; extraCarePerHour: number; urgentFee: number; waitFeePer30: number }>("/api/bookings/prices");