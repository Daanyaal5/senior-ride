import { EXTRA_CARE_MAX_HOURS, EXTRA_CARE_PER_HOUR, URGENT_FEE, ZONE_FARES, ZONES, Zone } from "../config/pricing.js";
import { detectZone } from "./zones.js";

export interface Place { address: string; lat: number; lng: number; }

export interface FareBreakdown {
  route: string;          // e.g. "Halifax to Halifax Airport"
  tripFare: number;       // flat price between the two areas
  extraCareHours: number;
  extraCareFee: number;   // hours x hourly rate
  urgentFee: number;      // URGENT_FEE when "Urgent ride" is ticked, otherwise 0
  total: number;          // tax included
}

/**
 * The trip is outside our fixed prices (long distance, or a pair with no price yet).
 * The customer is shown the message and asked to contact you.
 */
export class ContactUsError extends Error {}

/** Keeps hours a whole number between 0 and the maximum. */
export const cleanHours = (h: unknown) => Math.min(EXTRA_CARE_MAX_HOURS, Math.max(0, Math.floor(Number(h) || 0)));

/** Formula: total = flat trip price for the two areas + (Extra Care hours x hourly rate) + urgent fee. Tax included. */
export function calculateFare(pickup: Place, dropoff: Place, extraCareHours: number, urgent = false): FareBreakdown {
  const from = detectZone(pickup);
  const to = detectZone(dropoff);
  if (!from || !to) throw new ContactUsError("This trip is outside our fixed-price areas. Please contact us for a price, 24/7.");

  // The same price applies in both directions, so the key is the two areas in alphabetical order.
  const tripFare = ZONE_FARES[[from, to].sort().join("|")];
  if (tripFare == null) throw new ContactUsError(`Please contact us for a price from ${ZONES[from].label} to ${ZONES[to].label}, 24/7.`);

  const hours = cleanHours(extraCareHours);
  const extraCareFee = hours * EXTRA_CARE_PER_HOUR;
  const urgentFee = urgent ? URGENT_FEE : 0;
  return { route: `${ZONES[from].label} to ${ZONES[to].label}`, tripFare, extraCareHours: hours, extraCareFee, urgentFee, total: tripFare + extraCareFee + urgentFee };
}

/** The price list shown on the home page, built from ZONE_FARES so it never goes out of date. */
export function priceList(): { route: string; price: number }[] {
  return Object.entries(ZONE_FARES)
    .filter(([, price]) => price != null)
    .map(([key, price]) => {
      const [a, b] = key.split("|") as Zone[];
      const route = a === b ? `Within ${ZONES[a].label}` : `${ZONES[a].label} ↔ ${ZONES[b].label}`;
      return { route, price: price as number };
    });
}