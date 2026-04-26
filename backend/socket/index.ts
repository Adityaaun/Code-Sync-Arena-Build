import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import Room from '../models/Room';
import { runCode } from '../services/judge0Service';
import { problems } from '../services/problems';

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

    socket.on('run_code', async ({ roomId, userId, code, language }) => {
      const problem = problems['two-sum'];
      const testResults = [];
      let allPassed = true;

      // Check if room is already finished
      const currentRoom = await Room.findOne({ roomId });
      if (currentRoom?.status === 'finished') return;

      try {
        for (const testCase of problem.testCases) {
          const result = await runCode(code, language, testCase.input);
          
          // Priority: compile_output > stderr > stdout
          const finalOutput = result.compile_output || result.stderr || result.stdout || 'No output';
          
          const passed = result.stdout.trim() === testCase.output.trim();
          if (!passed) allPassed = false;
          
          testResults.push({
            passed,
            output: finalOutput,
            status: result.status
          });
        }

        // Emit results to the whole room so everyone sees the progress
        io.to(roomId).emit('result_update', {
          userId,
          results: testResults,
          allPassed
        });

        // Atomic Winner Logic
        if (allPassed) {
          const updatedRoom = await Room.findOneAndUpdate(
            { roomId, status: 'active', winner: { $exists: false } },
            { $set: { status: 'finished', winner: userId } },
            { new: true }
          );

          if (updatedRoom) {
            io.to(roomId).emit('match_ended', {
              winnerId: userId,
              status: 'finished'
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Code execution failed' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
