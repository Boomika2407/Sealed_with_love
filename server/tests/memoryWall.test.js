import test from 'node:test';
import assert from 'node:assert/strict';
import { containsProfanity, censorText } from '../src/utils/profanity.js';

test('Profanity filter utility for Memory Wall', async (t) => {
  await t.test('detects clean friendly text as clean', () => {
    assert.equal(containsProfanity('Having fun at Canteen with chai and samosas!'), false);
    assert.equal(containsProfanity('Happy graduation to 2026 batch! 🎓'), false);
  });

  await t.test('detects profanities accurately', () => {
    assert.equal(containsProfanity('This is bullshit'), true);
    assert.equal(containsProfanity('Damn that was hard'), true);
  });

  await t.test('censors profanities with asterisks', () => {
    const censored = censorText('This is bullshit');
    assert.equal(censored.includes('bullshit'), false);
    assert.equal(censored.includes('****'), true);
  });
});
