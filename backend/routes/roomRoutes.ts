import express from 'express';
import { createRoom, joinRoom, getRoom } from '../controllers/roomController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticate, createRoom);
router.post('/join/:roomId', authenticate, joinRoom);
router.get('/:roomId', authenticate, getRoom);

export default router;
