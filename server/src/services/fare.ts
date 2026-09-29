import { PRICING } from "../config/pricing.js";

export interface FareInput {
  distanceKm: number;
  durationMin: number;
  extraCare: boolean;
  asap: boolean;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  extraCareFee: number;
  asapFee: number;
  total: number;
}

// Round to whole cents so we never show values like 12.3333.
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Formula: total = base + (km * perKm) + (minutes * perMinute) + extraCare + asap
 * The total is raised to the minimum fare if the ride is very short.
 */
export function calculateFare(input: FareInput): FareBreakdown {
  const baseFare = PRICING.baseFare;
  const distanceFare = round2(input.distanceKm * PRICING.perKm);
  const timeFare = round2(input.durationMin * PRICING.perMinute);
  const extraCareFee = input.extraCare ? PRICING.extraCareFee : 0;
  const asapFee = input.asap ? PRICING.asapFee : 0;

  const subtotal = baseFare + distanceFare + timeFare + extraCareFee + asapFee;
  const total = round2(Math.max(subtotal, PRICING.minimumFare));

  return { baseFare, distanceFare, timeFare, extraCareFee, asapFee, total };
}
