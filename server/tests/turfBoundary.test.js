import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Campus from '../src/models/Campus.js';
import Spot from '../src/models/Spot.js';
import { isPointInsideCampus } from '../src/utils/turfGeo.js';

describe('Turf.js Campus Polygon Boundary & Spot Integration', () => {
  let mongod;
  let authToken;

  // Real campus polygon boundary coordinates (Coimbatore Institute of Technology campus perimeter)
  const CAMPUS_BOUNDARY = {
    type: 'Polygon',
    coordinates: [
      [
        [77.024792, 11.0252095],
        [77.0248796, 11.0246174],
        [77.0254527, 11.0246677],
        [77.0255216, 11.0243531],
        [77.0296894, 11.025048],
        [77.0296368, 11.0271274],
        [77.029296, 11.0284461],
        [77.0291505, 11.0297877],
        [77.0286976, 11.0301435],
        [77.0285581, 11.0306955],
        [77.025105, 11.0282723],
        [77.0254559, 11.0268839],
        [77.0257352, 11.0253567],
        [77.024792, 11.0252095]
      ]
    ]
  };

  // Spot definitely inside the polygon: CIT Central Library [77.0270, 11.0268]
  const INSIDE_POINT = { lon: 77.0270, lat: 11.0268 };

  // Spot definitely outside the polygon: (Far outside campus bounds)
  const OUTSIDE_POINT = { lon: 77.0150, lat: 11.0350 };

  before(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_turf_2026';
    process.env.ENCRYPTION_KEY = 'test_32_bytes_aes_gcm_secret_key!';

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    // Create Campus document
    await Campus.create({
      name: 'Coimbatore Institute of Technology',
      code: 'CIT_COIMBATORE',
      city: 'Coimbatore',
      center: [77.0274, 11.0277],
      boundary: CAMPUS_BOUNDARY,
      isActive: true
    });

    // Register student
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Boomika',
        email: 'boomika@college.edu',
        password: 'password123',
        batch: '2024-2028',
        college: 'Coimbatore Institute of Technology'
      });
    authToken = res.body.token;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('1. Turf.js correctly identifies coordinates inside the campus polygon', () => {
    const isInside = isPointInsideCampus(
      INSIDE_POINT.lon,
      INSIDE_POINT.lat,
      CAMPUS_BOUNDARY
    );
    assert.equal(isInside, true);
  });

  it('2. Turf.js correctly identifies coordinates outside the campus polygon', () => {
    const isInside = isPointInsideCampus(
      OUTSIDE_POINT.lon,
      OUTSIDE_POINT.lat,
      CAMPUS_BOUNDARY
    );
    assert.equal(isInside, false);
  });

  it('3. Rejects capsule creation if a custom pin is dropped OUTSIDE the campus polygon', async () => {
    const res = await request(app)
      .post('/api/capsules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Custom Pin Memory in the City',
        capsuleType: 'CLASS_MEMORY',
        message: 'This should be blocked because it is outside college!',
        unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        locationName: 'Outside College Spot',
        latitude: OUTSIDE_POINT.lat,
        longitude: OUTSIDE_POINT.lon,
        radiusMeters: 50
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'OUTSIDE_CAMPUS_BOUNDARY');
    assert.match(res.body.message, /outside.*campus bounds/i);
  });

  it('4. Accepts capsule creation with custom pin INSIDE the campus polygon', async () => {
    const res = await request(app)
      .post('/api/capsules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Secret Study Bench in Quadrangle',
        capsuleType: 'CLASS_MEMORY',
        message: 'Hidden bench under the banyan tree inside campus!',
        unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        locationName: 'Hidden Banyan Bench',
        latitude: INSIDE_POINT.lat,
        longitude: INSIDE_POINT.lon,
        radiusMeters: 50
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
  });

  it('5. Registers a new Spot via /api/spots and validates boundary', async () => {
    const createSpotRes = await request(app)
      .post('/api/spots')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Innovation & Incubation Hub',
        category: 'academic',
        description: 'Where student startups take flight.',
        longitude: 77.0268,
        latitude: 11.0260,
        radiusMeters: 55
      });

    assert.equal(createSpotRes.status, 201);
    assert.equal(createSpotRes.body.spot.name, 'Innovation & Incubation Hub');
    assert.equal(createSpotRes.body.spot.radiusMeters, 55);

    // Verify GET /api/spots returns the new spot
    const listRes = await request(app).get('/api/spots');
    assert.equal(listRes.status, 200);
    const found = listRes.body.spots.find((s) => s.name === 'Innovation & Incubation Hub');
    assert.ok(found);
  });

  it('6. Rejects new Spot if coordinates are outside campus polygon', async () => {
    const res = await request(app)
      .post('/api/spots')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Railway Station',
        category: 'gate',
        longitude: OUTSIDE_POINT.lon,
        latitude: OUTSIDE_POINT.lat,
        radiusMeters: 100
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'OUTSIDE_CAMPUS_BOUNDARY');
  });

  it('7. Delivers active campus profile with Polygon boundary via /api/campus', async () => {
    const res = await request(app).get('/api/campus');
    assert.equal(res.status, 200);
    assert.equal(res.body.campus.name, 'Coimbatore Institute of Technology');
    assert.equal(res.body.campus.boundary.type, 'Polygon');
    assert.ok(res.body.campus.boundary.coordinates.length > 0);
  });
});
