/**
 * Geolocation & Haversine formula utilities for campus proximity validation.
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates the great-circle distance between two coordinates in meters using the Haversine formula.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in meters
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    throw new Error('Invalid coordinates supplied to calculateHaversineDistance');
  }

  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Validates whether user coordinates satisfy the campus unlock spot requirements.
 * Reads GPS accuracy and clamps realistic jitter margin.
 * 
 * @param {Object} params
 * @param {number} params.userLat - User's current latitude
 * @param {number} params.userLon - User's current longitude
 * @param {number} [params.userAccuracy] - Device GPS accuracy radius in meters
 * @param {number} params.targetLat - Target campus spot latitude
 * @param {number} params.targetLon - Target campus spot longitude
 * @param {number} [params.radiusMeters=100] - Configurable unlock radius in meters (default 100m)
 * @param {string} [params.locationName='the chosen spot'] - Human-readable spot name
 * @returns {Object} { isWithinRange: boolean, distanceMeters: number, allowedRadius: number, message: string, accuracyWarning?: string }
 */
export function verifyLocationAccess({
  userLat,
  userLon,
  userAccuracy,
  targetLat,
  targetLon,
  radiusMeters = 100,
  locationName = 'the chosen spot'
}) {
  const distance = calculateHaversineDistance(userLat, userLon, targetLat, targetLon);
  const roundedDist = Math.round(distance);

  // If GPS accuracy is excessively degraded (> 300m), warn or reject
  const MAX_RELIABLE_ACCURACY = 300;
  if (userAccuracy !== undefined && userAccuracy !== null && userAccuracy > MAX_RELIABLE_ACCURACY) {
    return {
      isWithinRange: false,
      distanceMeters: roundedDist,
      allowedRadius: radiusMeters,
      error: 'POOR_GPS_ACCURACY',
      message: `Your GPS signal is too noisy (±${Math.round(userAccuracy)}m accuracy). Step outside the building and try again!`
    };
  }

  // Account for slight indoor/foliage GPS drift: max 25m assist based on accuracy
  const accuracyMargin = userAccuracy ? Math.min(Math.max(userAccuracy * 0.4, 0), 25) : 0;
  const effectiveRadius = radiusMeters + accuracyMargin;
  const isWithinRange = distance <= effectiveRadius;

  let message = '';
  if (isWithinRange) {
    message = `Spot confirmed! You are at ${locationName} (${roundedDist}m away).`;
  } else {
    // Campus-themed microcopy
    message = `You are ${roundedDist}m away from ${locationName}. You need to be within ${radiusMeters}m. Go get a samosa and walk! 🚶‍♂️`;
  }

  return {
    isWithinRange,
    distanceMeters: roundedDist,
    allowedRadius: radiusMeters,
    effectiveRadius: Math.round(effectiveRadius),
    userAccuracy: userAccuracy ? Math.round(userAccuracy) : null,
    message
  };
}
