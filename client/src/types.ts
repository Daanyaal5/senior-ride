// Shared shapes used across the client.
export interface Place { address: string; lat: number; lng: number; }

export interface FareBreakdown {
  baseFare: number; distanceFare: number; timeFare: number;
  extraCareFee: number; asapFee: number; total: number;
}

export interface Estimate { distanceKm: number; durationMin: number; fare: FareBreakdown; }
