import express from 'express';
import { getPublicWall } from '../controllers/wallController.js';

const router = express.Router();

// Public campus wall of unlocked memories (accessible to all students)
router.get('/', getPublicWall);

export default router;
