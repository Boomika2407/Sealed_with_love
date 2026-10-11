import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance, verifyLocationAccess } from '../src/utils/geo.js';

describe('Geospatial & Haversine Distance Engine', () => {
  // Test campus spots (e.g., Campus Main Gate & Campus Canteen)
  const MAIN_GATE = { lat: 12.971598, lon: 77.594562 };
  // A spot roughly 75 meters away
  const CAMPUS_LAWN = { lat: 12.972100, lon: 77.594900 };
  // A spot roughly 850 meters away (Hostel Block)
  const HOSTEL_BLOCK = { lat: 12.978000, lon: 77.599000 };

  it('calculates 0 meters for identical coordinates', () => {
    const dist = calculateHaversineDistance(
      MAIN_GATE.lat,
      MAIN_GATE.lon,
      MAIN_GATE.lat,
      MAIN_GATE.lon
    );
    assert.equal(Math.round(dist), 0);
  });

  it('accurately calculates distance between known campus points', () => {
    const distLawn = calculateHaversineDistance(
      MAIN_GATE.lat,
      MAIN_GATE.lon,
      CAMPUS_LAWN.lat,
      CAMPUS_LAWN.lon
    );
    // Should be approximately 60-80 meters
    assert.ok(distLawn > 50 && distLawn < 95, `Expected distance around 75m, got ${distLawn}`);

    const distHostel = calculateHaversineDistance(
      MAIN_GATE.lat,
      MAIN_GATE.lon,
      HOSTEL_BLOCK.lat,
      HOSTEL_BLOCK.lon
    );
    // Should be > 800 meters
    assert.ok(distHostel > 800, `Expected distance > 800m, got ${distHostel}`);
  });

  it('confirms access when within default 100m radius', () => {
    const result = verifyLocationAccess({
      userLat: CAMPUS_LAWN.lat,
      userLon: CAMPUS_LAWN.lon,
      targetLat: MAIN_GATE.lat,
      targetLon: MAIN_GATE.lon,
      radiusMeters: 100,
      locationName: 'Main Gate'
    });

    assert.equal(result.isWithinRange, true);
    assert.match(result.message, /Spot confirmed/i);
  });

  it('rejects access when outside radius and returns samosa walk microcopy', () => {
    const result = verifyLocationAccess({
      userLat: HOSTEL_BLOCK.lat,
      userLon: HOSTEL_BLOCK.lon,
      targetLat: MAIN_GATE.lat,
      targetLon: MAIN_GATE.lon,
      radiusMeters: 100,
      locationName: 'Main Gate'
    });

    assert.equal(result.isWithinRange, false);
    assert.match(result.message, /Go get a samosa and walk/i);
    assert.ok(result.distanceMeters > 500);
  });

  it('respects configurable custom radius per spot (e.g. 50m strict radius)', () => {
    // CAMPUS_LAWN is ~70m away, so 50m radius should reject
    const resultStrict = verifyLocationAccess({
      userLat: CAMPUS_LAWN.lat,
      userLon: CAMPUS_LAWN.lon,
      targetLat: MAIN_GATE.lat,
      targetLon: MAIN_GATE.lon,
      radiusMeters: 50,
      locationName: 'Library Steps'
    });

    assert.equal(resultStrict.isWithinRange, false);
    assert.equal(resultStrict.allowedRadius, 50);

    // But if radius is 120m, it should accept
    const resultGenerous = verifyLocationAccess({
      userLat: CAMPUS_LAWN.lat,
      userLon: CAMPUS_LAWN.lon,
      targetLat: MAIN_GATE.lat,
      targetLon: MAIN_GATE.lon,
      radiusMeters: 120,
      locationName: 'Library Steps'
    });

    assert.equal(resultGenerous.isWithinRange, true);
  });

  it('handles realistic GPS accuracy jitter margin', () => {
    // If student is 108m away with a 20m GPS accuracy margin
    const resultWithAccuracy = verifyLocationAccess({
      userLat: CAMPUS_LAWN.lat,
      userLon: CAMPUS_LAWN.lon,
      userAccuracy: 25,
      targetLat: MAIN_GATE.lat,
      targetLon: MAIN_GATE.lon,
      radiusMeters: 65,
      locationName: 'Main Gate'
    });

    // 65m radius + min(25*0.4, 25) = 65 + 10 = 75m effective radius
    assert.ok(resultWithAccuracy.effectiveRadius >= 65);
  });

  it('rejects excessively noisy GPS accuracy (> 300m)', () => {
    const poorGpsResult = verifyLocationAccess({
      userLat: MAIN_GATE.lat,
      userLon: MAIN_GATE.lon,
      userAccuracy: 450, // 450 meters accuracy is too low
      targetLat: MAIN_GATE.lat,
      targetLon: MAIN_GATE.lon,
      radiusMeters: 100,
      locationName: 'Main Gate'
    });

    assert.equal(poorGpsResult.isWithinRange, false);
    assert.equal(poorGpsResult.error, 'POOR_GPS_ACCURACY');
    assert.match(poorGpsResult.message, /noisy/i);
  });

  it('throws on invalid coordinate inputs', () => {
    assert.throws(() => {
      calculateHaversineDistance('invalid', null, 12, 77);
    }, /Invalid coordinates/);
  });
});
