import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import Room from '../models/Room';

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('opponent_joined', { userId });
    });

    socket.on('code_change', async ({ roomId, userId, code }) => {
      // Broadcast to others in the room immediately for smooth UI
      socket.to(roomId).emit('code_change', { userId, code });

      // Save to DB in background (last-write-wins)
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $set: { [`codes.${userId}`]: code } }
        );
      } catch (err) {
        console.error('Error saving code:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
