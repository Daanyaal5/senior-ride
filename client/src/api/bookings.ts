import { Estimate, FareBreakdown, Place } from "../types";

// The data the booking form sends to the server.
export interface BookingRequest {
  name: string; phone: string; secondaryPhone: string; email: string;
  pickup: Place; dropoff: Place;
  asap: boolean; scheduledTime: string | null;
  extraCare: boolean; preferredLanguage: string;
  verifiedToken: string; // proof from the phone check
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
  post<{ reference: string; fare: FareBreakdown; checkoutUrl: string }>("/api/bookings", b);

/** Texts a 6-digit code to the phone number. */
export const sendCode = (phone: string) => post<{ ok: true }>("/api/verify/send", { phone });

/** Checks the code. On success the server returns a token that the booking must include. */
export const checkCode = (phone: string, code: string) => post<{ token: string }>("/api/verify/check", { phone, code });
