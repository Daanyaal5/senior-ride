// Prices, areas and fees now live in server/data/*.csv. Edit those files instead of this one.

/** Halifax Stanfield International Airport terminal. Any address within radiusKm counts as the airport. */
export const AIRPORT = { lat: 44.8808, lng: -63.5086, radiusKm: 3 };

/** Must match the airport's name in server/data/areas.csv. */
export const AIRPORT_AREA = "Halifax Airport";

/** The name of the hourly "driver helps and stays with you" option, shown in emails. Also set in client/src/utils/brand.ts. */
export const ASSISTANCE_NAME = "Personal Assistance";