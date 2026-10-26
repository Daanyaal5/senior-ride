// All prices are in Canadian dollars and INCLUDE TAX.
// Change prices here; the website and the price list update automatically.

/** The areas we serve. Add a new area here and in ZONE_FARES below. */
export type Zone = "halifax" | "dartmouth" | "sackville" | "airport";

/**
 * How an address is matched to an area.
 * - The airport is found by distance (anything within AIRPORT.radiusKm of the terminal).
 * - Other areas use the first 3 characters of the postal code. Please double-check these.
 * - placeNames are used only when an address has no postal code.
 */
export const ZONES: Record<Zone, { label: string; postalPrefixes: string[]; placeNames: string[] }> = {
  airport: {
    label: "Halifax Airport",
    postalPrefixes: [],
    placeNames: ["stanfield", "halifax airport", "halifax international airport"],
  },
  halifax: {
    label: "Halifax",
    postalPrefixes: ["B3H", "B3J", "B3K", "B3L", "B3M", "B3N", "B3P", "B3R", "B3S"],
    placeNames: ["halifax"],
  },
  dartmouth: {
    label: "Dartmouth",
    postalPrefixes: ["B2V", "B2W", "B2X", "B2Y", "B3A", "B3B"],
    placeNames: ["dartmouth"],
  },
  sackville: {
    label: "Sackville",
    postalPrefixes: ["B4C", "B4E", "B4G"],
    placeNames: ["sackville"],
  },
};

/** Halifax Stanfield International Airport terminal. */
export const AIRPORT = { lat: 44.8808, lng: -63.5086, radiusKm: 3 };

/**
 * Flat trip prices between areas (either direction).
 * Keys are the two area names in alphabetical order, joined by "|".
 * null = no online price: the customer is asked to contact you instead.
 */
export const ZONE_FARES: Record<string, number | null> = {
  "halifax|halifax": 110,
  "dartmouth|halifax": 150,
  "halifax|sackville": 175,
  "airport|halifax": 185,
  "airport|dartmouth": 165,
  "airport|sackville": 150,
  "dartmouth|dartmouth": 100,
  "dartmouth|sackville": 170,
  "sackville|sackville": 100,
  "airport|airport": null,       // airport to airport: contact us
};

/** Extra Care (help from the driver), charged per hour. */
export const EXTRA_CARE_PER_HOUR = 25;
export const EXTRA_CARE_MAX_HOURS = 8;

/** Added when the customer ticks "Urgent ride" (a same-day or short-notice ride). */
export const URGENT_FEE = 99;

/** Waiting time: charged for every 30 minutes the driver waits. Not part of the booking price. */
export const WAIT_FEE_PER_30_MIN = 20;