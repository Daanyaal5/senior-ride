import { Estimate, FareBreakdown, Place } from "../types";

// The data the booking form sends to the server.
export interface BookingRequest {
  name: string; phone: string; secondaryPhone: string; email: string;
  pickup: Place; dropoff: Place;
  asap: boolean; scheduledTime: string | null;
  extraCare: boolean; preferredLanguage: string;
}

/** Small helper: POSTs JSON and throws the server's error message if something fails. */
async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data as T;
}

/** Asks the server for distance, time and fare while the person fills in the form. */
export const getEstimate = (b: Pick<BookingRequest, "pickup" | "dropoff" | "asap" | "extraCare">) =>
  post<Estimate>("/api/bookings/estimate", b);

/** Submits the finished booking. */
export const submitBooking = (b: BookingRequest) =>
  post<{ reference: string; fare: FareBreakdown }>("/api/bookings", b);
