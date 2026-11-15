import { AIRPORT, AIRPORT_AREA } from "../config/pricing.js";
import { Area, getPriceData } from "../config/priceData.js";

// Canadian postal code, e.g. "B3R 0A7" or "b3r0a7". Group 1 is the first 3 characters.
const POSTAL_CODE = /\b([A-Z]\d[A-Z])\s?\d[A-Z]\d\b/i;

/** Straight-line distance in km between two points (haversine formula). */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** True if any of the area's place names appears in the address text. */
const nameMatches = (area: Area, text: string) => area.placeNames.some((n) => text.includes(n));

/**
 * Works out which area (from areas.csv) a place is in. Returns null when it is outside the areas we serve.
 * Order: 1) near the airport terminal, 2) postal code, 3) place name in the address.
 */
export function detectZone(place: { address: string; lat: number; lng: number }): string | null {
  const { areas } = getPriceData();
  if (distanceKm(place, AIRPORT) <= AIRPORT.radiusKm) return AIRPORT_AREA;

  const text = place.address.toLowerCase();
  const prefix = place.address.match(POSTAL_CODE)?.[1].toUpperCase();
  if (prefix) {
    const byPostal = areas.filter((a) => a.postalCodes.includes(prefix));
    // Two areas can share a postal code (e.g. Bedford and Hammonds Plains). The place name decides between them.
    if (byPostal.length) return (byPostal.find((a) => nameMatches(a, text)) ?? byPostal[0]).name;
  }

  // No postal code, or one we don't list: try the place names. Halifax is checked last, because
  // "Halifax" also appears in the airport's name and in addresses for the whole region.
  const ordered = [...areas.filter((a) => a.name !== "Halifax"), ...areas.filter((a) => a.name === "Halifax")];
  return ordered.find((a) => a.name !== AIRPORT_AREA && nameMatches(a, text))?.name ?? null;
}