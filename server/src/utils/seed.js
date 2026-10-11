import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Capsule from '../models/Capsule.js';
import Campus from '../models/Campus.js';
import Spot from '../models/Spot.js';
import { encryptMessage } from './crypto.js';

export async function seedDemoDataIfEmpty() {
  try {
    // 1. Seed real Campus Polygon and Spots from seed/spots.json
    let seedFilePath = path.resolve('seed/spots.json');
    if (!fs.existsSync(seedFilePath)) {
      seedFilePath = path.resolve('../seed/spots.json');
    }
    if (!fs.existsSync(seedFilePath)) {
      seedFilePath = path.resolve('server/seed/spots.json');
    }

    let campusDoc = await Campus.findOne({ isActive: true });
    let spotsCount = await Spot.countDocuments();

    // If campus changed (e.g. from PSG to CIT), refresh database to align with new seed
    if (campusDoc && fs.existsSync(seedFilePath)) {
      try {
        const checkData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
        if (checkData.campus && campusDoc.code !== checkData.campus.code) {
          console.log(`[Seed] Updating campus from ${campusDoc.name} to ${checkData.campus.name}...`);
          await Campus.deleteMany({});
          await Spot.deleteMany({});
          await Capsule.deleteMany({});
          await User.deleteMany({});
          campusDoc = null;
          spotsCount = 0;
        }
      } catch (e) {
        console.warn('[Seed] Check error:', e.message);
      }
    }

    if ((!campusDoc || spotsCount === 0) && fs.existsSync(seedFilePath)) {
      console.log(`[Seed] Loading real college campus spots from ${seedFilePath}...`);
      const rawData = fs.readFileSync(seedFilePath, 'utf8');
      const seedData = JSON.parse(rawData);

      if (!campusDoc && seedData.campus) {
        campusDoc = await Campus.create({
          name: seedData.campus.name,
          code: seedData.campus.code,
          city: seedData.campus.city,
          center: seedData.campus.center,
          zoom: seedData.campus.zoom || 17,
          boundary: seedData.campus.boundary,
          isActive: true
        });
        console.log(`✅ [Seed] Registered real campus: ${campusDoc.name}`);
      }

      if (spotsCount === 0 && seedData.spots && seedData.spots.length > 0) {
        for (const s of seedData.spots) {
          await Spot.create({
            name: s.name,
            campus: campusDoc?._id,
            category: s.category,
            description: s.description,
            location: s.location,
            radiusMeters: s.radiusMeters || 100,
            isActive: true
          });
        }
        console.log(`✅ [Seed] Registered ${seedData.spots.length} real campus spots with GeoJSON Point coordinates.`);
      }
    }

    // 2. Check if student user and capsules exist
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('[Seed] Seeding initial student account and campus capsules...');

    // Get seeded spots for reference
    const mainGateSpot = await Spot.findOne({ category: 'gate' });
    const canteenSpot = await Spot.findOne({ category: 'canteen' });
    const amphitheaterSpot = await Spot.findOne({ category: 'iconic' });

    // 3. Create demo student user
    const user = await User.create({
      name: 'Boomika',
      email: 'boomika@college.edu',
      password: 'securePassword123',
      batch: '2024-2028',
      college: campusDoc ? campusDoc.name : 'Coimbatore Institute of Technology',
      avatar: '🎓'
    });

    const fourYearsFuture = new Date();
    fourYearsFuture.setFullYear(fourYearsFuture.getFullYear() + 4);

    const oneMonthFuture = new Date();
    oneMonthFuture.setMonth(oneMonthFuture.getMonth() + 1);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    // 4. Freshers Letter locked for 4 years at Main Gate
    const gateCoords = mainGateSpot
      ? mainGateSpot.location.coordinates
      : [77.0256, 11.0249];
    const gateRadius = mainGateSpot ? mainGateSpot.radiusMeters : 50;

    const enc1 = encryptMessage(
      'Remember the first morning you stepped through the CIT Main Gate on Avinashi Road? You were so nervous about finding lecture halls and labs. I hope you built cool projects, made friends for a lifetime, and are proud of yourself!'
    );
    await Capsule.create({
      title: 'A Note to My Future Graduating Self 🎓',
      capsuleType: 'FRESHERS_LETTER',
      creator: user._id,
      creatorName: user.name,
      batch: user.batch,
      unlockDate: fourYearsFuture,
      location: {
        name: mainGateSpot ? mainGateSpot.name : 'CIT Main Gate (Avinashi Road)',
        type: 'Point',
        coordinates: gateCoords,
        radiusMeters: gateRadius
      },
      visibility: 'PUBLIC_WALL',
      messageCiphertext: enc1.ciphertext,
      messageIv: enc1.iv,
      messageTag: enc1.tag,
      theme: { color: 'blush', stamp: 'wax-heart', tiltDeg: -1.5 },
      isUnlocked: false
    });

    // 5. Class memory locked at Canteen
    const canteenCoords = canteenSpot
      ? canteenSpot.location.coordinates
      : [77.0265, 11.0258];
    const canteenRadius = canteenSpot ? canteenSpot.radiusMeters : 75;

    const enc2 = encryptMessage(
      'CIT canteen tea and samosa breaks at 4 PM were the real therapy during exam season. If you are standing here reading this, go buy a hot samosa and cutting chai right now!'
    );
    await Capsule.create({
      title: 'Canteen Chai & Samosa Chronicles ☕',
      capsuleType: 'CLASS_MEMORY',
      creator: user._id,
      creatorName: user.name,
      batch: user.batch,
      unlockDate: oneMonthFuture,
      location: {
        name: canteenSpot ? canteenSpot.name : 'CIT Student Canteen & Food Court',
        type: 'Point',
        coordinates: canteenCoords,
        radiusMeters: canteenRadius
      },
      visibility: 'PUBLIC_WALL',
      messageCiphertext: enc2.ciphertext,
      messageIv: enc2.iv,
      messageTag: enc2.tag,
      theme: { color: 'yellow', stamp: 'wax-star', tiltDeg: 1.2 },
      isUnlocked: false
    });

    // 6. Batch farewell already unlocked on campus wall
    const amphiCoords = amphitheaterSpot
      ? amphitheaterSpot.location.coordinates
      : [77.0274, 11.0272];

    const enc3 = encryptMessage(
      'To the entire Batch of 2024-2028: We survived online lectures, 8 AM labs, project vivas, and 11:59 PM deadline panic. Proud of every single one of us!'
    );
    await Capsule.create({
      title: 'Batch of 2024 Farewell Anthem 🎓',
      capsuleType: 'BATCH_FAREWELL',
      creator: user._id,
      creatorName: user.name,
      batch: user.batch,
      unlockDate: pastDate,
      location: {
        name: amphitheaterSpot ? amphitheaterSpot.name : 'CIT Open Air Theatre (OAT) & Quadrangle',
        type: 'Point',
        coordinates: amphiCoords,
        radiusMeters: 65
      },
      visibility: 'PUBLIC_WALL',
      messageCiphertext: enc3.ciphertext,
      messageIv: enc3.iv,
      messageTag: enc3.tag,
      theme: { color: 'lilac', stamp: 'wax-crest', tiltDeg: -0.8 },
      isUnlocked: true,
      unlockedAt: pastDate,
      unlockedBy: [user._id],
      reactions: { hearts: 15, reactedUsers: [] }
    });

    console.log('✅ [Seed] Successfully initialized demo student account and capsules.');
  } catch (err) {
    console.warn('[Seed] Note during seeding:', err.message);
  }
}
