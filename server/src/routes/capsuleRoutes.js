import express from 'express';
import multer from 'multer';
import {
  createCapsule,
  getMyCapsules,
  getCapsuleById,
  unlockCapsule,
  reactToCapsule
} from '../controllers/capsuleController.js';
import { protect } from '../middleware/auth.js';
import { unlockLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Multer memory storage for direct cloud/buffer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted for time capsules'), false);
    }
  }
});

// All capsule actions require authentication
router.use(protect);

router.post('/', upload.single('photo'), createCapsule);
router.get('/my-capsules', getMyCapsules);
router.get('/:id', getCapsuleById);

// Rate-limited unlock endpoint with server-enforced access control
router.post('/:id/unlock', unlockLimiter, unlockCapsule);

// Campus wall heart reactions
router.post('/:id/react', reactToCapsule);

export default router;
