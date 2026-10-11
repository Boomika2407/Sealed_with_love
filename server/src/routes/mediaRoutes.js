import express from 'express';
import fs from 'fs';
import path from 'path';
import { verifySignedMediaToken } from '../utils/mediaStorage.js';

const router = express.Router();
const LOCAL_STORAGE_DIR = path.resolve('uploads/private');

/**
 * Route to serve private media files locally using time-limited signed tokens.
 */
router.get('/secure/:publicId', (req, res) => {
  const { publicId } = req.params;
  const { expires, token } = req.query;

  // Verify HMAC signature and expiration
  const isValid = verifySignedMediaToken(publicId, expires, token);
  if (!isValid) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Signed media link has expired or is invalid'
    });
  }

  // Find file in private storage
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    return res.status(404).json({ success: false, message: 'Media not found' });
  }

  const files = fs.readdirSync(LOCAL_STORAGE_DIR);
  const matchingFile = files.find((f) => f.startsWith(publicId));

  if (!matchingFile) {
    return res.status(404).json({ success: false, message: 'Media file not found' });
  }

  const fullPath = path.join(LOCAL_STORAGE_DIR, matchingFile);
  res.sendFile(fullPath);
});

export default router;
