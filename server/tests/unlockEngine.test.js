import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Capsule from '../src/models/Capsule.js';
import User from '../src/models/User.js';
import { runMaturityCheck } from '../src/jobs/unlockScheduler.js';

describe('Server-Enforced Access Control & Unlock Lock Engine (Integration)', () => {
  let mongod;
  let authToken;
  let testUserId;
  let capsuleId;

  // Campus coordinates: Main Gate
  const MAIN_GATE = { lat: 12.971598, lon: 77.594562 };
  // Remote spot: Hostel (850m away)
  const HOSTEL = { lat: 12.978000, lon: 77.599000 };

  before(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_sealed_2026';
    process.env.ENCRYPTION_KEY = 'test_32_bytes_aes_gcm_secret_key!';

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Register a student
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Boomika',
        email: 'boomika@college.edu',
        password: 'securePassword123',
        batch: '2024-2028',
        college: 'Campus Tech'
      });

    assert.equal(regRes.status, 201);
    authToken = regRes.body.token;
    testUserId = regRes.body.user.id;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('1. Seals a capsule with AES-256-GCM encryption at rest and select:false fields', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 4); // 4 years from now

    const res = await request(app)
      .post('/api/capsules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Letter to my 2028 Graduating Self',
        capsuleType: 'FRESHERS_LETTER',
        message: 'Remember the late night coding sessions and the canteen chai!',
        unlockDate: futureDate.toISOString(),
        locationName: 'Campus Main Gate',
        latitude: MAIN_GATE.lat,
        longitude: MAIN_GATE.lon,
        radiusMeters: 50, // 50m strict radius
        visibility: 'PUBLIC_WALL'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Sealed. Don't even think about peeking.");
    assert.ok(res.body.capsule._id);
    capsuleId = res.body.capsule._id;

    // Verify database document: plaintext message MUST NOT exist in database!
    const rawDoc = await Capsule.findById(capsuleId).select(
      '+messageCiphertext +messageIv +messageTag'
    );
    assert.ok(rawDoc.messageCiphertext, 'Raw document has encrypted ciphertext');
    assert.ok(rawDoc.messageIv, 'Raw document has IV');
    assert.ok(rawDoc.messageTag, 'Raw document has tag');
    assert.equal(rawDoc.message, undefined, 'Plaintext message does NOT exist in document');
  });

  it('2. Enforces zero content leakage on list and detail endpoints for locked capsules', async () => {
    // Test get list endpoint
    const listRes = await request(app)
      .get('/api/capsules/my-capsules')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(listRes.status, 200);
    const listedCap = listRes.body.capsules.find((c) => c._id === capsuleId);
    assert.ok(listedCap);
    assert.equal(listedCap.isUnlocked, false);
    // CRITICAL: message and mediaUrl MUST be undefined
    assert.equal(listedCap.message, undefined);
    assert.equal(listedCap.mediaUrl, undefined);
    assert.equal(listedCap.messageCiphertext, undefined);

    // Test get by ID endpoint
    const detailRes = await request(app)
      .get(`/api/capsules/${capsuleId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(detailRes.status, 200);
    assert.equal(detailRes.body.capsule.message, undefined);
    assert.equal(detailRes.body.capsule.mediaUrl, undefined);
  });

  it('3. Rejects unlock when date has NOT arrived', async () => {
    const res = await request(app)
      .post(`/api/capsules/${capsuleId}/unlock`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        latitude: MAIN_GATE.lat,
        longitude: MAIN_GATE.lon,
        accuracy: 10
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'TIME_LOCKED');
    assert.match(res.body.message, /Chill|Locked for another/i);
  });

  it('4. Rejects unlock when date is satisfied but user is at WRONG location', async () => {
    // Advance unlock date in database to the past (server UTC time satisfied naturally)
    await Capsule.findByIdAndUpdate(capsuleId, {
      unlockDate: new Date(Date.now() - 1000 * 60)
    });

    const res = await request(app)
      .post(`/api/capsules/${capsuleId}/unlock`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        latitude: HOSTEL.lat, // 850m away from Main Gate
        longitude: HOSTEL.lon,
        accuracy: 15
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'LOCATION_LOCKED');
    assert.match(res.body.message, /Go get a samosa and walk/i);
  });

  it('5. Successfully unlocks and decrypts content when BOTH time & location criteria pass', async () => {
    const res = await request(app)
      .post(`/api/capsules/${capsuleId}/unlock`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        latitude: MAIN_GATE.lat,
        longitude: MAIN_GATE.lon,
        accuracy: 8
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'WELCOME BACK. You survived college. 🎓');
    assert.equal(res.body.capsule.isUnlocked, true);
    assert.equal(
      res.body.capsule.message,
      'Remember the late night coding sessions and the canteen chai!'
    );
  });

  it('6. Allows heart reactions on unlocked capsules', async () => {
    const reactRes = await request(app)
      .post(`/api/capsules/${capsuleId}/react`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(reactRes.status, 200);
    assert.equal(reactRes.body.success, true);
    assert.equal(reactRes.body.hearts, 1);
    assert.equal(reactRes.body.hasReacted, true);
  });

  it('7. Displays unlocked public capsules on Campus Wall with decrypted message', async () => {
    const wallRes = await request(app).get('/api/wall');

    assert.equal(wallRes.status, 200);
    assert.ok(wallRes.body.capsules.length >= 1);
    const wallItem = wallRes.body.capsules.find((c) => c._id === capsuleId);
    assert.ok(wallItem);
    assert.equal(
      wallItem.message,
      'Remember the late night coding sessions and the canteen chai!'
    );
    assert.equal(wallItem.reactions.hearts, 1);
  });

  it('8. Verifies node-cron scheduler processes matured capsules and triggers notifications', async () => {
    // Create an expired capsule with isNotified: false
    const maturedCapsule = await Capsule.create({
      title: 'Graduation Day Notice',
      capsuleType: 'CLASS_MEMORY',
      creator: testUserId,
      creatorName: 'Boomika',
      batch: '2024-2028',
      unlockDate: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
      location: {
        name: 'Library Steps',
        type: 'Point',
        coordinates: [MAIN_GATE.lon, MAIN_GATE.lat],
        radiusMeters: 50
      },
      messageCiphertext: 'dummy',
      messageIv: 'dummy',
      messageTag: 'dummy',
      isNotified: false
    });

    const cronResult = await runMaturityCheck();
    assert.ok(cronResult.processed >= 1);

    const updated = await Capsule.findById(maturedCapsule._id);
    assert.equal(updated.isNotified, true);
  });

  it('9. Enforces rate limiting on /unlock to prevent GPS brute-force attacks', async () => {
    // Fire rapid requests to trip the 10 req/min rate limit
    let hitRateLimit = false;
    for (let i = 0; i < 15; i++) {
      const res = await request(app)
        .post(`/api/capsules/${capsuleId}/unlock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ latitude: MAIN_GATE.lat, longitude: MAIN_GATE.lon, accuracy: 5 });

      if (res.status === 429) {
        hitRateLimit = true;
        assert.match(res.body.message, /trying to unlock too rapidly/i);
        break;
      }
    }
    assert.equal(hitRateLimit, true, 'Rate limiter should trigger 429 after 10 requests');
  });
});
