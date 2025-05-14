import express from 'express';
import { recordPlay } from '../controllers/playController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Record a song play
router.post('/add', authenticate, recordPlay);

export default router; 