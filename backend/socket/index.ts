import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Room from '../models/Room';
import { runCode } from '../services/judge0Service';
import { IRunCodePayload, IProblem } from '../types';

const toPublicProblem = (problem: IProblem) => ({
  _id: problem._id,
  title: problem.title,
  description: problem.description,
  topic: problem.topic,
  difficulty: problem.difficulty,
  examples: problem.examples,
  starterCode: problem.starterCode,
});

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
      if (!decoded.userId) return next(new Error('Invalid authentication token'));

      socket.data.userId = decoded.userId;
      next();
    } catch (_error) {
      next(new Error('Invalid authentication token'));
    }
  });

  const socketToUser = new Map<string, { userId: string; roomId: string }>();

  io.on('connection', (socket: Socket) => {
    const authenticatedUserId = socket.data.userId as string;

    const getSession = (roomId: string) => {
      const session = socketToUser.get(socket.id);
      if (!session || session.roomId !== roomId || session.userId !== authenticatedUserId) {
        socket.emit('error', { message: 'Unauthorized room action' });
        return null;
      }
      return session;
    };

    socket.on('join_room', async ({ roomId }: { roomId: string }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const isPlayer = room.players.some((player) => player.toString() === authenticatedUserId);
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this room' });
          return;
        }

        socket.join(roomId);
        socketToUser.set(socket.id, { userId: authenticatedUserId, roomId });

        if (room.problemData) {
          socket.emit('problem_assigned', toPublicProblem(room.problemData as unknown as IProblem));
        }

        socket.to(roomId).emit('opponent_joined', { userId: authenticatedUserId });
      } catch (_error) {
        socket.emit('error', { message: 'Unable to join room' });
      }
    });

    socket.on('code_change', async ({ roomId, code }: { roomId: string; code: string }) => {
      if (!getSession(roomId)) return;

      socket.to(roomId).emit('code_change', { userId: authenticatedUserId, code });
      try {
        await Room.findOneAndUpdate(
          { roomId, players: authenticatedUserId },
          { $set: { [`codes.${authenticatedUserId}`]: code } }
        );
      } catch (err) {
        console.error('Error saving code:', err);
      }
    });

    socket.on('run_code', async ({ roomId, code, language }: IRunCodePayload) => {
      try {
        if (!getSession(roomId)) return;

        const room = await Room.findOne({ roomId, players: authenticatedUserId });
        if (!room || !room.problemData) {
          socket.emit('error', { message: 'Problem not found for this room' });
          return;
        }

        const problem = room.problemData as unknown as IProblem;
        const testResults = [];

        for (const testCase of problem.testCases) {
          if (testCase.isHidden) continue;

          const result = await runCode(code, language, testCase.input);
          const finalOutput = result.compile_output || result.stderr || result.stdout || 'No output';
          const passed = result.stdout.trim() === testCase.expectedOutput.trim();

          testResults.push({ passed, output: finalOutput, status: result.status });
        }

        socket.emit('result_update', { userId: authenticatedUserId, results: testResults });
      } catch (_error) {
        socket.emit('error', { message: 'Code execution failed' });
      }
    });

    socket.on('submit_code', async ({ roomId, code, language }: IRunCodePayload) => {
      try {
        if (!getSession(roomId)) return;

        socket.to(roomId).emit('opponent_submitting');
        const room = await Room.findOne({ roomId, players: authenticatedUserId });
        if (!room || !room.problemData) {
          socket.emit('error', { message: 'Problem not found for this room' });
          return;
        }

        if (room.status === 'finished') return;

        const problem = room.problemData as unknown as IProblem;
        const testResults = [];
        let allPassed = true;

        for (const testCase of problem.testCases) {
          const result = await runCode(code, language, testCase.input);
          const passed = result.stdout.trim() === testCase.expectedOutput.trim();
          if (!passed) allPassed = false;

          testResults.push({ passed, status: result.status });
        }

        socket.emit('result_update', { userId: authenticatedUserId, results: testResults });

        if (allPassed) {
          const updatedRoom = await Room.findOneAndUpdate(
            { roomId, status: 'active', winner: { $exists: false }, players: authenticatedUserId },
            { $set: { status: 'finished', winner: authenticatedUserId } },
            { new: true }
          );

          if (updatedRoom) {
            io.to(roomId).emit('match_ended', { winnerId: authenticatedUserId, status: 'finished' });
          }
        } else {
          socket.emit('error', { message: 'Some test cases failed. Submission rejected.' });
        }
      } catch (_error) {
        socket.emit('error', { message: 'Submission failed' });
      }
    });

    socket.on('disconnect', async () => {
      const session = socketToUser.get(socket.id);
      socketToUser.delete(socket.id);

      if (!session) return;

      const { userId, roomId } = session;
      try {
        const room = await Room.findOne({ roomId, status: 'active' });
        if (room && room.players.length === 2) {
          const opponentId = room.players.find((player) => player.toString() !== userId);

          if (opponentId) {
            await Room.findOneAndUpdate(
              { roomId, status: 'active', winner: { $exists: false } },
              { $set: { status: 'finished', winner: opponentId } }
            );

            io.to(roomId).emit('match_ended', {
              winnerId: opponentId,
              reason: 'opponent_left'
            });
          }
        }
      } catch (err) {
        console.error('Error handling disconnect win:', err);
      }
    });
  });

  return io;
};
