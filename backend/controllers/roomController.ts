import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Room from '../models/Room';
import { v4 as uuidv4 } from 'uuid';

import { getRandomProblem } from '../services/problemService';

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, difficulty } = req.body;
    const roomId = uuidv4().substring(0, 8);

    const problem = await getRandomProblem(topic, difficulty);
    if (!problem) {
      res.status(404).json({ message: 'No problems available for this topic/difficulty' });
      return;
    }

    const room = new Room({
      roomId,
      players: [req.userId],
      status: 'waiting',
      problemId: problem._id,
      problemData: problem
    });
    await room.save();
    res.status(201).json(room);
  } catch (error: any) {
    console.error('Room creation error:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating room',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      res.status(400).json({ message: 'Room is full' });
      return;
    }

    if (room.players.includes(req.userId as any)) {
      res.status(200).json(room);
      return;
    }

    room.players.push(req.userId as any);
    if (room.players.length === 2) {
      room.status = 'active';
      room.startTime = new Date();
    }
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error joining room', error });
  }
};

export const getRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId }).populate('players', 'username');
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error });
  }
};
