/**
 * Haversine distance between two lat/lon points (km)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * ETA = Distance / Speed (minutes)
 * Returns "Calculating..." if speed is unavailable or 0
 */
export function calculateETA(distanceKm, speedKmh) {
  if (!speedKmh || speedKmh <= 0) return 'Calculating...';
  const minutes = (distanceKm / speedKmh) * 60;
  if (minutes < 1) return '< 1 min';
  return `~${Math.round(minutes)} min`;
}

/**
 * Find the next upcoming stop for a bus based on its position
 */
export function findNextStop(busLat, busLon, stops) {
  if (!stops || stops.length === 0) return null;

  let minDist = Infinity;
  let nearestIdx = 0;

  stops.forEach((stop, idx) => {
    const dist = calculateDistance(busLat, busLon, stop.latitude, stop.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearestIdx = idx;
    }
  });

  // If closest stop is behind the bus (distance very small), pick the next one
  if (minDist < 0.1 && nearestIdx < stops.length - 1) {
    return { stop: stops[nearestIdx + 1], distance: calculateDistance(busLat, busLon, stops[nearestIdx + 1].latitude, stops[nearestIdx + 1].longitude) };
  }

  return { stop: stops[nearestIdx], distance: minDist };
}

/**
 * Format speed for display
 */
export function formatSpeed(speedKmh) {
  if (!speedKmh || speedKmh <= 0) return '0 km/h';
  return `${Math.round(speedKmh)} km/h`;
}

/**
 * Format time ago
 */
export function timeAgo(date) {
  if (!date) return 'Never';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
