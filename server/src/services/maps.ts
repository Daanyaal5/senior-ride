export interface LatLng { lat: number; lng: number; }
export interface RouteInfo { distanceKm: number; durationMin: number; }

/**
 * Asks the Google Routes API for driving distance and time between two points.
 * The key stays on the server so customers can never see or change it.
 */
export async function getRouteInfo(from: LatLng, to: LatLng): Promise<RouteInfo> {
  const point = (p: LatLng) => ({ location: { latLng: { latitude: p.lat, longitude: p.lng } } });

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY ?? "",
      // Only request the two fields we need (cheaper and faster).
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({ origin: point(from), destination: point(to), travelMode: "DRIVE" }),
  });

  if (!res.ok) throw new Error(`Routes API error ${res.status}`);
  const data = (await res.json()) as { routes?: { distanceMeters: number; duration: string }[] };
  const route = data.routes?.[0];
  if (!route) throw new Error("No route found between these locations");

  return {
    distanceKm: route.distanceMeters / 1000,
    // Google returns durations like "1260s"; parseInt drops the trailing "s".
    durationMin: parseInt(route.duration, 10) / 60,
  };
}
