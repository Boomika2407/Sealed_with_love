import crypto from 'crypto';

/**
 * AES-256-GCM encryption at rest utility.
 * Enforces authenticated encryption with 96-bit IV and 128-bit auth tag.
 */

// Derive or get a 32-byte key from environment or fallback dev key
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || 'sealed_dev_secret_key_32_bytes_length!!';
  // Ensure exactly 32 bytes (256 bits)
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypt a plaintext message using AES-256-GCM.
 * @param {string} plaintext 
 * @returns {{ ciphertext: string, iv: string, tag: string }}
 */
export function encryptMessage(plaintext) {
  if (plaintext === undefined || plaintext === null) {
    return { ciphertext: '', iv: '', tag: '' };
  }

  const key = getSecretKey();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(String(plaintext), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag: tag
  };
}

/**
 * Decrypt an AES-256-GCM encrypted payload.
 * Throws error if tag fails authentication (tamper detection).
 * @param {string} ciphertext Hex encoded
 * @param {string} iv Hex encoded
 * @param {string} tag Hex encoded
 * @returns {string} Decrypted plaintext
 */
export function decryptMessage(ciphertext, iv, tag) {
  if (!ciphertext) return '';
  if (!iv || !tag) {
    throw new Error('Missing IV or Auth Tag for AES-256-GCM decryption');
  }

  const key = getSecretKey();
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
