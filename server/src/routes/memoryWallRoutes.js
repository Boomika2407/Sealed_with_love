import express from 'express';
import {
  wallUpload,
  createMemoryPost,
  getMemoryWall,
  reactToPost,
  addComment,
  replyToComment,
  savePost,
  reportPost,
  deleteMemoryPost,
  adminHidePost,
  getSpotMapPins,
  shareCapsuleToWall
} from '../controllers/memoryWallController.js';
import { protect } from '../middleware/auth.js';
import { memoryPostLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All memory wall routes require authentication
router.use(protect);

// Feed
router.get('/', getMemoryWall);
router.get('/spots-map', getSpotMapPins);

// Create post (with file upload + rate limit)
router.post('/', memoryPostLimiter, wallUpload.array('media', 6), createMemoryPost);

// Share capsule as wall post
router.post('/share-capsule', shareCapsuleToWall);

// Interactions
router.post('/:id/react', reactToPost);
router.post('/:id/comments', addComment);
router.post('/:id/comments/:commentId/reply', replyToComment);
router.post('/:id/save', savePost);
router.post('/:id/report', reportPost);

// Owner delete
router.delete('/:id', deleteMemoryPost);

// Admin moderation
router.put('/:id/hide', adminHidePost);

export default router;
