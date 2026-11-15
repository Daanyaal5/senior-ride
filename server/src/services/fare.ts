import { getPriceData } from "../config/priceData.js";
import { detectZone } from "./zones.js";

export interface Place { address: string; lat: number; lng: number; }

export interface FareBreakdown {
  route: string;          // e.g. "Halifax to Halifax Airport"
  tripFare: number;       // flat price between the two areas
  extraCareHours: number; // hours of Personal Assistance
  extraCareFee: number;   // hours x hourly rate
  urgentFee: number;      // urgent ride fee when "Urgent ride" is ticked, otherwise 0
  total: number;          // tax included
}

/**
 * The trip is outside our fixed prices (long distance, or a pair with no price yet).
 * The customer is shown the message and asked to contact you.
 */
export class ContactUsError extends Error {}

/** Keeps hours a whole number between 0 and the maximum in fees.csv. */
export const cleanHours = (h: unknown) =>
  Math.min(getPriceData().fees.assistanceMaxHours, Math.max(0, Math.floor(Number(h) || 0)));

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Finds the trip price in prices.csv, in either direction.
 * A line naming both exact areas wins; otherwise a line with * (any area) is used.
 */
function tripPrice(from: string, to: string): number | null {
  const { prices } = getPriceData();
  const exact = prices.find((r) => (same(r.from, from) && same(r.to, to)) || (same(r.from, to) && same(r.to, from)));
  if (exact) return exact.price;
  const matches = (side: string, area: string) => side === "*" || same(side, area);
  const wild = prices.find((r) => (matches(r.from, from) && matches(r.to, to)) || (matches(r.from, to) && matches(r.to, from)));
  return wild ? wild.price : null;
}

/** Formula: total = trip price for the two areas + (assistance hours x hourly rate) + urgent fee. Tax included. */
export function calculateFare(pickup: Place, dropoff: Place, extraCareHours: number, urgent = false): FareBreakdown {
  const { fees } = getPriceData();
  const from = detectZone(pickup);
  const to = detectZone(dropoff);
  if (!from || !to) throw new ContactUsError("This trip is outside our fixed-price areas. Please contact us for a price, 24/7.");

  const tripFare = tripPrice(from, to);
  if (tripFare == null) throw new ContactUsError(`Please contact us for a price from ${from} to ${to}, 24/7.`);

  const hours = cleanHours(extraCareHours);
  const extraCareFee = hours * fees.assistancePerHour;
  const urgentFee = urgent ? fees.urgentRide : 0;
  return { route: `${from} to ${to}`, tripFare, extraCareHours: hours, extraCareFee, urgentFee, total: tripFare + extraCareFee + urgentFee };
}

/** The price list shown on the home page, straight from prices.csv. */
export function priceList(): { route: string; price: number }[] {
  return getPriceData().prices.map(({ from, to, price }) => {
    const route =
      from === "*" || to === "*" ? `${from === "*" ? to : from} ↔ anywhere we serve`
      : same(from, to) ? `Within ${from}`
      : `${from} ↔ ${to}`;
    return { route, price };
  });
}