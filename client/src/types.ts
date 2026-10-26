// Shared shapes used across the client.
export interface Place { address: string; lat: number; lng: number; }

/** The price, worked out by the server. All amounts include tax. */
export interface FareBreakdown {
  route: string;          // e.g. "Halifax to Halifax Airport"
  tripFare: number;
  extraCareHours: number;
  extraCareFee: number;
  urgentFee: number;      // 0 unless "Urgent ride" is ticked
  total: number;
}

export type PaymentMethod = "card" | "applepay" | "etransfer" | "cash";