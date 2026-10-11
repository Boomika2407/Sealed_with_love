import cron from 'node-cron';
import Capsule from '../models/Capsule.js';
import { sendCapsuleReadyEmail } from '../services/notificationService.js';

/**
 * Checks for capsules that have reached their unlock date and sends ready notifications.
 * Runs atomically to update isNotified.
 */
export async function runMaturityCheck() {
  try {
    const now = new Date();
    // Find capsules whose unlock date has passed and haven't been notified yet
    const readyCapsules = await Capsule.find({
      unlockDate: { $lte: now },
      isNotified: false
    }).populate('creator', 'name email');

    if (readyCapsules.length === 0) {
      return { processed: 0 };
    }

    console.log(`[Cron Job] Found ${readyCapsules.length} matured capsules to notify.`);

    let sentCount = 0;
    for (const capsule of readyCapsules) {
      if (capsule.creator && capsule.creator.email) {
        await sendCapsuleReadyEmail({
          to: capsule.creator.email,
          userName: capsule.creator.name,
          capsuleTitle: capsule.title,
          spotName: capsule.location.name,
          unlockDate: capsule.unlockDate
        });
      }

      // Mark as notified so email is never resent
      capsule.isNotified = true;
      await capsule.save();
      sentCount++;
    }

    console.log(`[Cron Job] Successfully notified ${sentCount} students.`);
    return { processed: sentCount };
  } catch (error) {
    console.error('[Cron Job Error] Failed to process matured capsules:', error);
    return { processed: 0, error: error.message };
  }
}

/**
 * Initializes the node-cron scheduler.
 * Runs once every hour (or customizable via CRON_SCHEDULE).
 */
export function initUnlockScheduler() {
  // Default: Every hour at minute 0
  const schedule = process.env.CRON_SCHEDULE || '0 * * * *';

  cron.schedule(schedule, async () => {
    console.log('[Cron Job] Executing scheduled capsule maturity check...');
    await runMaturityCheck();
  });

  console.log(`[Scheduler] Capsule maturity cron initialized with pattern: "${schedule}"`);
}
