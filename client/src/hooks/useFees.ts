import { useEffect, useState } from "react";
import { getPrices } from "../api/bookings";

export interface Fees { assistancePerHour: number; maxHours: number; urgent: number; waitPer30: number; }

// Shown until the server answers. The real amounts come from server/data/fees.csv.
const FALLBACK: Fees = { assistancePerHour: 25, maxHours: 8, urgent: 99, waitPer30: 20 };
let cached: Promise<Fees> | null = null;

/** The fees from server/data/fees.csv, loaded once and shared by every page. */
export function useFees(): Fees {
  const [fees, setFees] = useState<Fees>(FALLBACK);
  useEffect(() => {
    cached ??= getPrices().then((p) => ({ assistancePerHour: p.extraCarePerHour, maxHours: p.maxHours, urgent: p.urgentFee, waitPer30: p.waitFeePer30 }));
    cached.then(setFees).catch(() => { cached = null; });
  }, []);
  return fees;
}