/**
 * Server-authoritative temporal access control.
 * Compares strictly against server UTC time.
 */

/**
 * Validates whether the current UTC time satisfies the capsule's unlock date.
 * 
 * @param {Date|string} unlockDate 
 * @returns {Object} { isUnlocked: boolean, daysLeft: number, hoursLeft: number, serverTimeUtc: string, unlockDateUtc: string, message: string }
 */
export function verifyTimeAccess(unlockDate) {
  const serverNow = new Date();
  const targetDate = new Date(unlockDate);

  if (isNaN(targetDate.getTime())) {
    throw new Error('Invalid unlockDate provided');
  }

  const diffMs = targetDate.getTime() - serverNow.getTime();
  const isUnlocked = diffMs <= 0;

  const totalHoursLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  const daysLeft = Math.ceil(totalHoursLeft / 24);

  let message = '';
  if (isUnlocked) {
    message = 'WELCOME BACK. The unlock date has arrived! 🎓';
  } else if (daysLeft > 365) {
    const years = (daysLeft / 365).toFixed(1);
    message = `Locked for another ${years} years. Chill, focus on your exams! 🙄`;
  } else if (daysLeft > 1) {
    message = `Bro, it's still locked for ${daysLeft} days. Chill. 🙄`;
  } else {
    message = `Almost there! Only ${totalHoursLeft} hours remaining until unlock. Hold on! ⏳`;
  }

  return {
    isUnlocked,
    daysLeft: isUnlocked ? 0 : daysLeft,
    hoursLeft: isUnlocked ? 0 : totalHoursLeft,
    serverTimeUtc: serverNow.toISOString(),
    unlockDateUtc: targetDate.toISOString(),
    message
  };
}
