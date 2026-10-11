import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const LOCAL_STORAGE_DIR = path.resolve('uploads/private');

// Ensure local private storage folder exists
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

/**
 * Uploads media file as private/authenticated.
 * @param {Object} file - Multer file object
 * @returns {Promise<{ publicId: string, secureUrl: string, storageType: 'cloudinary'|'local' }>}
 */
export async function uploadPrivateMedia(file) {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    // Upload as 'authenticated' to Cloudinary (blocks public access)
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'sealed_capsules',
          type: 'authenticated', // Access restricted
          resource_type: 'image'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            storageType: 'cloudinary'
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Local fallback: save file with unique ID in private folder
  const fileExt = path.extname(file.originalname) || '.jpg';
  const localId = `local_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const filename = `${localId}${fileExt}`;
  const filePath = path.join(LOCAL_STORAGE_DIR, filename);

  fs.writeFileSync(filePath, file.buffer);

  return {
    publicId: localId,
    secureUrl: `/api/media/secure/${localId}`,
    storageType: 'local'
  };
}

/**
 * Generates a short-lived signed URL (valid for 5 minutes) for an authenticated media file.
 * Only invoked by the unlock endpoint upon verified access.
 * 
 * @param {string} publicId
 * @param {string} storageType
 * @returns {string} Signed URL valid for 300 seconds (5 minutes)
 */
export function generateSignedMediaUrl(publicId, storageType = 'cloudinary') {
  if (!publicId) return null;

  const EXPIRY_SECONDS = 300; // 5 minutes validity
  const expiresAt = Math.floor(Date.now() / 1000) + EXPIRY_SECONDS;

  if (storageType === 'cloudinary' && isCloudinaryConfigured) {
    // Generate signed authenticated URL for Cloudinary
    return cloudinary.url(publicId, {
      type: 'authenticated',
      sign_url: true,
      expires_at: expiresAt,
      secure: true
    });
  }

  // Local storage signed token generator
  const secret = process.env.JWT_SECRET || 'sealed_media_token_secret';
  const payload = `${publicId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return `/api/media/secure/${publicId}?expires=${expiresAt}&token=${signature}`;
}

/**
 * Verifies short-lived token for local media downloads
 */
export function verifySignedMediaToken(publicId, expires, token) {
  if (!publicId || !expires || !token) return false;
  if (parseInt(expires, 10) < Math.floor(Date.now() / 1000)) return false; // Expired

  const secret = process.env.JWT_SECRET || 'sealed_media_token_secret';
  const payload = `${publicId}:${expires}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return expected === token;
}
