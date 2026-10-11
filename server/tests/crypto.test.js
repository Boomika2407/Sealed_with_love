import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encryptMessage, decryptMessage } from '../src/utils/crypto.js';

describe('AES-256-GCM Encryption At Rest Engine', () => {
  const secretLetter = 'Dear Future Me, do not forget how much chai we drank during finals week!';

  it('encrypts plaintext into ciphertext with distinct IV and Auth Tag', () => {
    const encrypted = encryptMessage(secretLetter);

    assert.ok(encrypted.ciphertext, 'Ciphertext should not be empty');
    assert.ok(encrypted.iv, 'IV must be generated');
    assert.ok(encrypted.tag, 'Authentication tag must be generated');

    // 12-byte IV in hex is 24 characters
    assert.equal(encrypted.iv.length, 24);
    // 16-byte Auth Tag in hex is 32 characters
    assert.equal(encrypted.tag.length, 32);
    // Ciphertext should NOT contain plaintext
    assert.ok(!encrypted.ciphertext.includes('Dear Future Me'));
  });

  it('successfully decrypts encrypted ciphertext back to exact original plaintext', () => {
    const encrypted = encryptMessage(secretLetter);
    const decrypted = decryptMessage(encrypted.ciphertext, encrypted.iv, encrypted.tag);

    assert.equal(decrypted, secretLetter);
  });

  it('produces unique IVs and ciphertexts for identical plaintext (defense against replay & rainbow tables)', () => {
    const enc1 = encryptMessage(secretLetter);
    const enc2 = encryptMessage(secretLetter);

    assert.notEqual(enc1.iv, enc2.iv);
    assert.notEqual(enc1.ciphertext, enc2.ciphertext);

    // Both should decrypt correctly
    assert.equal(decryptMessage(enc1.ciphertext, enc1.iv, enc1.tag), secretLetter);
    assert.equal(decryptMessage(enc2.ciphertext, enc2.iv, enc2.tag), secretLetter);
  });

  it('detects tampering and throws error if ciphertext is manipulated', () => {
    const encrypted = encryptMessage(secretLetter);

    // Alter one byte in ciphertext
    const tamperedCiphertext =
      encrypted.ciphertext.substring(0, 4) === 'aaaa'
        ? 'bbbb' + encrypted.ciphertext.substring(4)
        : 'aaaa' + encrypted.ciphertext.substring(4);

    assert.throws(() => {
      decryptMessage(tamperedCiphertext, encrypted.iv, encrypted.tag);
    }, /Unsupported state or unable to authenticate data/);
  });

  it('detects tampering and throws error if auth tag is forged', () => {
    const encrypted = encryptMessage(secretLetter);
    const fakeTag = '00'.repeat(16); // 16 zero bytes

    assert.throws(() => {
      decryptMessage(encrypted.ciphertext, encrypted.iv, fakeTag);
    }, /Unsupported state or unable to authenticate data/);
  });

  it('handles empty message gracefully', () => {
    const emptyResult = encryptMessage('');
    assert.equal(emptyResult.ciphertext, '');
    assert.equal(decryptMessage('', '', ''), '');
  });
});
