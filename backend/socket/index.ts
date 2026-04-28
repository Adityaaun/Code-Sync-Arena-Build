import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import Room from '../models/Room';
import { runCode } from '../services/judge0Service';
import { IJoinRoomPayload, ICodeChangePayload, IRunCodePayload, IProblem } from '../types';

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  const socketToUser = new Map<string, { userId: string, roomId: string }>();

  io.on('connection', (socket: Socket) => {
    socket.on('join_room', async ({ roomId, userId }: IJoinRoomPayload) => {
      socket.join(roomId);
      socketToUser.set(socket.id, { userId, roomId });

      const room = await Room.findOne({ roomId });
      if (room && room.problemData) {
        socket.emit('problem_assigned', room.problemData);
      }

      socket.to(roomId).emit('opponent_joined', { userId });
    });

    socket.on('code_change', async ({ roomId, userId, code }: ICodeChangePayload) => {
      socket.to(roomId).emit('code_change', { userId, code });
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $set: { [`codes.${userId}`]: code } }
        );
      } catch (err) {
        console.error('Error saving code:', err);
      }
    });

    socket.on('run_code', async ({ roomId, userId, code, language }: IRunCodePayload) => {
      try {
        const room = await Room.findOne({ roomId });
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

        socket.emit('result_update', {
          userId,
          results: testResults
        });
      } catch (error) {
        socket.emit('error', { message: 'Code execution failed' });
      }
    });

    socket.on('submit_code', async ({ roomId, userId, code, language }: IRunCodePayload) => {
      try {
        socket.to(roomId).emit('opponent_submitting');
        const room = await Room.findOne({ roomId });
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

        socket.emit('result_update', { userId, results: testResults });

        if (allPassed) {
          const updatedRoom = await Room.findOneAndUpdate(
            { roomId, status: 'active', winner: { $exists: false } },
            { $set: { status: 'finished', winner: userId } },
            { new: true }
          );

          if (updatedRoom) {
            io.to(roomId).emit('match_ended', { winnerId: userId, status: 'finished' });
          }
        } else {
          socket.emit('error', { message: 'Some test cases failed. Submission rejected.' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Submission failed' });
      }
    });


    socket.on('disconnect', async () => {
      const session = socketToUser.get(socket.id);

      if (session) {
        const { userId, roomId } = session;
        socketToUser.delete(socket.id);

        try {
          const room = await Room.findOne({ roomId, status: 'active' });
          if (room && room.players.length === 2) {
            const opponentId = room.players.find(p => p.toString() !== userId);

            if (opponentId) {
              await Room.findOneAndUpdate(
                { roomId },
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
      }
    });
  });
  return io;
};

