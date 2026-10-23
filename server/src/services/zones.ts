import { AIRPORT, Zone, ZONES } from "../config/pricing.js";

// Canadian postal code, e.g. "B3R 0A7" or "b3r0a7". Group 1 is the first 3 characters.
const POSTAL_CODE = /\b([A-Z]\d[A-Z])\s?\d[A-Z]\d\b/i;

// When there is no postal code, check names in this order. Halifax is last because
// "Halifax" also appears in the airport's name and in addresses for the whole region.
const NAME_ORDER: Zone[] = ["airport", "dartmouth", "sackville", "halifax"];

/** Straight-line distance in km between two points (haversine formula). */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Works out which area a place is in. Returns null when it is outside the areas we serve (long distance). */
export function detectZone(place: { address: string; lat: number; lng: number }): Zone | null {
  if (distanceKm(place, AIRPORT) <= AIRPORT.radiusKm) return "airport";

  const postal = place.address.match(POSTAL_CODE);
  if (postal) {
    const prefix = postal[1].toUpperCase();
    return (Object.keys(ZONES) as Zone[]).find((z) => ZONES[z].postalPrefixes.includes(prefix)) ?? null;
  }
  const text = place.address.toLowerCase();
  return NAME_ORDER.find((z) => ZONES[z].placeNames.some((name) => text.includes(name))) ?? null;
}