const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

// Simple in-memory cache to prevent redundant API calls
const routeCache = new Map();

/**
 * Fetches a road-snapped route from OSRM given an array of stop coordinates.
 * @param {Array<{latitude: number, longitude: number}>} stops 
 * @returns {Promise<Array<[number, number]> | null>} Returns an array of [lat, lng] for the route polyline, or null if it fails.
 */
export const fetchRoadSnappedRoute = async (stops, forceRefresh = false) => {
  if (!stops || stops.length < 2) return null;

  // Filter out any invalid coordinates
  const validStops = stops.filter(s => s && typeof s.latitude === 'number' && typeof s.longitude === 'number');
  if (validStops.length < 2) return null;

  // OSRM expects longitude,latitude
  const coordinateString = validStops.map(s => `${s.longitude},${s.latitude}`).join(';');
  
  if (forceRefresh) {
    routeCache.delete(coordinateString);
  }

  // Check cache first
  if (routeCache.has(coordinateString)) {
    return routeCache.get(coordinateString);
  }

  try {
    const response = await fetch(`${OSRM_BASE_URL}/${coordinateString}?overview=full&geometries=geojson`);
    if (!response.ok) {
      console.warn("OSRM API returned an error:", response.status, response.statusText);
      return null; // Graceful fallback
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn("OSRM API could not find a route:", data.code);
      return null;
    }

    // OSRM geojson returns coordinates as [longitude, latitude]
    // Leaflet Polyline expects [latitude, longitude]
    const geojsonCoords = data.routes[0].geometry.coordinates;
    const leafletCoords = geojsonCoords.map(coord => [coord[1], coord[0]]);

    // Cache the result
    routeCache.set(coordinateString, leafletCoords);

    return leafletCoords;
  } catch (err) {
    console.error("OSRM Routing failed:", err);
    return null; // Graceful fallback
  }
};
