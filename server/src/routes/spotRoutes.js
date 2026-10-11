import express from 'express';
import {
  getCampus,
  getSpots,
  createSpot,
  updateSpot,
  deleteSpot
} from '../controllers/spotController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Publicly readable for students picking spots
router.get('/', getSpots);
router.get('/campus', getCampus);

// Admin / authenticated management
router.post('/', protect, createSpot);
router.put('/:id', protect, updateSpot);
router.delete('/:id', protect, deleteSpot);

export default router;
