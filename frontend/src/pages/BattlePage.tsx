import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import Timer from '../components/Timer';

interface Player {
  id: string;
  username: string;
}

interface RoomData {
  roomId: string;
  players: Player[];
  status: 'waiting' | 'active' | 'finished';
}

const BattlePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [status, setStatus] = useState('Joining...');
  const [myCode, setMyCode] = useState('// Write your code here\n');
  const [opponentCode, setOpponentCode] = useState('// Opponent code will appear here\n');
  const [language, setLanguage] = useState('javascript');

  const sampleProblem = {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ]
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/room/${roomId}`);
        setRoom(response.data);
        if (response.data.status === 'active') {
          setStatus('Battle Active!');
        } else {
          setStatus('Waiting for opponent...');
        }
      } catch (err) {
        setStatus('Error loading room');
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (socket && user && roomId) {
      socket.emit('join_room', { roomId, userId: user.id });

      socket.on('opponent_joined', () => {
        setStatus('Opponent joined! Battle Active!');
      });

      return () => {
        socket.off('opponent_joined');
      };
    }
  }, [socket, user, roomId]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <div>
          <h4 style={{ margin: 0 }}>Room: {roomId}</h4>
          <span style={{ fontSize: '0.8em', color: '#666' }}>{status}</span>
        </div>
        <Timer initialSeconds={1800} /> {/* 30 mins */}
        <div>
          <button style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Submit Solution
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel: Problem */}
        <div style={{ width: '40%', height: '100%' }}>
          <ProblemPanel 
            title={sampleProblem.title}
            description={sampleProblem.description}
            examples={sampleProblem.examples}
          />
        </div>

        {/* Right Panel: Editors */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ height: '70%', borderBottom: '4px solid #ddd' }}>
            <CodeEditor 
              code={myCode}
              onChange={(val) => setMyCode(val || '')}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
          <div style={{ height: '30%' }}>
            <CodeEditor 
              code={opponentCode}
              onChange={() => {}} // Opponent code is read-only
              language={language}
              setLanguage={() => {}}
              isReadOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePage;
