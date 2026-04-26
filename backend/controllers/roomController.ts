import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Room from '../models/Room';
import { v4 as uuidv4 } from 'uuid';

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roomId = uuidv4().substring(0, 8); // Simple 8-char ID
    const newRoom = new Room({
      roomId,
      players: [req.userId],
      status: 'waiting'
    });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error });
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
