import { Place } from "../types";

/**
 * A box around Halifax, Dartmouth, Sackville, Bedford, Hammonds Plains and the airport. Address suggestions only come from inside it.
 * The server then decides the exact area and price. Anything else is "long distance: contact us".
 */
export const SERVICE_BOUNDS = {
  south: 44.57,  // below Spryfield and Purcell's Cove
  north: 44.90,  // above Halifax Stanfield airport
  west: -63.88,  // west of Hammonds Plains
  east: -63.44,  // east of Cole Harbour
};

export const SERVICE_AREA_TEXT = "Halifax, Dartmouth, Sackville, Bedford, Hammonds Plains or the airport";

/** One tap fills in the airport, so airport travellers don't need to type it. */
export const AIRPORT_PLACE: Place = {
  address: "Halifax Stanfield International Airport, 1 Bell Blvd, Enfield, NS B2T 1K2, Canada",
  lat: 44.8808,
  lng: -63.5086,
};