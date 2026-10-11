import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verifyTimeAccess } from '../src/utils/time.js';

describe('Server-Authoritative UTC Time Verification Engine', () => {
  it('confirms access when unlock date is in the past', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10); // 10 days ago
    const result = verifyTimeAccess(pastDate);

    assert.equal(result.isUnlocked, true);
    assert.equal(result.daysLeft, 0);
    assert.match(result.message, /WELCOME BACK/i);
  });

  it('rejects access when unlock date is in the future and gives campus chill microcopy', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4); // 4 days in future
    const result = verifyTimeAccess(futureDate);

    assert.equal(result.isUnlocked, false);
    assert.ok(result.daysLeft >= 3);
    assert.match(result.message, /Bro, it's still locked for \d+ days\. Chill\./i);
  });

  it('generates multi-year microcopy for Freshers 4-year capsules', () => {
    const fourYearsFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 4);
    const result = verifyTimeAccess(fourYearsFuture);

    assert.equal(result.isUnlocked, false);
    assert.match(result.message, /Locked for another.*years.*focus on your exams/i);
  });

  it('provides precise remaining hours when unlock date is within 24 hours', () => {
    const twelveHoursFuture = new Date(Date.now() + 1000 * 60 * 60 * 12);
    const result = verifyTimeAccess(twelveHoursFuture);

    assert.equal(result.isUnlocked, false);
    assert.ok(result.hoursLeft >= 11 && result.hoursLeft <= 13);
    assert.match(result.message, /Almost there! Only \d+ hours remaining/i);
  });

  it('strictly throws an error on invalid date inputs', () => {
    assert.throws(() => {
      verifyTimeAccess('not-a-valid-date-string');
    }, /Invalid unlockDate/i);
  });
});
