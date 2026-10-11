import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

/**
 * Validates whether a [longitude, latitude] point is inside a GeoJSON Polygon boundary.
 * Used to enforce that custom pins dropped by students are within their actual college campus!
 * 
 * @param {number} longitude Longitude in degrees
 * @param {number} latitude Latitude in degrees
 * @param {Object|Array} boundaryGeoJson GeoJSON Polygon object or array of coordinates
 * @returns {boolean} True if point is within polygon bounds
 */
export function isPointInsideCampus(longitude, latitude, boundaryGeoJson) {
  try {
    if (
      typeof longitude !== 'number' || typeof latitude !== 'number' ||
      isNaN(longitude) || isNaN(latitude) || !boundaryGeoJson
    ) {
      return false;
    }

    const coordinates = boundaryGeoJson.coordinates
      ? boundaryGeoJson.coordinates
      : boundaryGeoJson;

    const pt = point([longitude, latitude]);
    const poly = polygon(coordinates);

    return booleanPointInPolygon(pt, poly);
  } catch (error) {
    console.error('[Turf Geo Error] Failed to evaluate point in polygon:', error);
    return false;
  }
}
