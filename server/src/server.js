import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';
import app from './app.js';
import { initUnlockScheduler } from './jobs/unlockScheduler.js';
import { seedDemoDataIfEmpty } from './utils/seed.js';

dotenv.config();

// Ensure Node.js can resolve MongoDB Atlas SRV records even if local ISP DNS fails
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore fallback if restricted
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sealed_campus';

async function startServer() {
  try {
    // Connect to configured MongoDB
    console.log(`[Database] Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ [Database] Connected to MongoDB successfully.');

    // Seed initial demo student account & sample capsules if database is empty
    await seedDemoDataIfEmpty();

    // Initialize node-cron maturity scheduler
    initUnlockScheduler();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 [Server] "Sealed" backend running on port ${PORT}`);
      console.log(`🔒 [Security] Security model: server-enforced access control (AES-256-GCM + GeoJSON)`);
    });
  } catch (error) {
    console.error('Fatal Server Error:', error);
    process.exit(1);
  }
}

startServer();
