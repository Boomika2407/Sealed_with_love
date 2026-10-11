/**
 * Client-side ray casting point-in-polygon algorithm
 * Provides instantaneous visual feedback on the map before submitting to server Turf.js verification.
 */
export function isPointInsideCampus(longitude, latitude, boundaryGeoJson) {
  if (!boundaryGeoJson || longitude === undefined || latitude === undefined) return false;

  const ring = boundaryGeoJson.coordinates?.[0] || boundaryGeoJson;
  if (!Array.isArray(ring) || ring.length < 3) return false;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
