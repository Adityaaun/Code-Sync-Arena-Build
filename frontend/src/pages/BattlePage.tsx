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
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const sampleProblem = {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. (Note: Output indices space-separated)',
    examples: [
      { input: '2 7 11 15\n9', output: '0 1', explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.' },
      { input: '3 2 4\n6', output: '1 2' }
    ]
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/room/${roomId}`);
        setRoom(response.data);
        if (response.data.status === 'active') {
          setStatus('Battle Active!');
        } else if (response.data.status === 'finished') {
          setStatus('Match Finished');
          setWinner(response.data.winner);
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

      socket.on('code_change', ({ userId, code }) => {
        if (userId !== user.id) {
          setOpponentCode(code);
        }
      });

      socket.on('result_update', ({ userId, results, allPassed }) => {
        if (userId === user.id) {
          setTestResults(results);
          setIsRunning(false);
        }
      });

      socket.on('match_ended', ({ winnerId }) => {
        setWinner(winnerId);
        setStatus('Match Finished');
      });

      return () => {
        socket.off('opponent_joined');
        socket.off('code_change');
        socket.off('result_update');
        socket.off('match_ended');
      };
    }
  }, [socket, user, roomId]);

  // Debounced code emission
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (socket && user && roomId && !winner && myCode !== '// Write your code here\n') {
        socket.emit('code_change', { roomId, userId: user.id, code: myCode });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [myCode, socket, user, roomId, winner]);

  const handleRunCode = () => {
    if (!socket || !user || !roomId || winner) return;
    setIsRunning(true);
    setTestResults([]);
    socket.emit('run_code', { roomId, userId: user.id, code: myCode, language });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Winner Overlay */}
      {winner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, color: 'white'
        }}>
          <h1 style={{ fontSize: '4em', marginBottom: '20px' }}>
            {winner === user?.id ? '🏆 YOU WON!' : '💀 YOU LOST'}
          </h1>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ padding: '15px 30px', fontSize: '1.2em', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white' }}
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <div>
          <h4 style={{ margin: 0 }}>Room: {roomId}</h4>
          <span style={{ fontSize: '0.8em', color: '#666' }}>{status}</span>
        </div>
        {!winner ? <Timer initialSeconds={1800} /> : <div style={{ fontWeight: 'bold' }}>Match Ended</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleRunCode}
            disabled={isRunning || !!winner}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: (isRunning || winner) ? 'not-allowed' : 'pointer' }}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button 
            disabled={!!winner}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: winner ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            Submit Solution
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel: Problem & Results */}
        <div style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            <ProblemPanel 
              title={sampleProblem.title}
              description={sampleProblem.description}
              examples={sampleProblem.examples}
            />
          </div>
          
          {/* Results Section */}
          <div style={{ height: '30%', borderTop: '2px solid #ddd', padding: '15px', backgroundColor: '#fff', overflowY: 'auto' }}>
            <h4>Test Results</h4>
            {testResults.length === 0 && !isRunning && <p style={{ color: '#888' }}>Run your code to see results.</p>}
            {isRunning && <p>Executing test cases...</p>}
            {testResults.map((res, index) => (
              <div key={index} style={{ marginBottom: '10px', padding: '10px', borderRadius: '4px', backgroundColor: res.passed ? '#e6fffa' : '#fff5f5', border: `1px solid ${res.passed ? '#38b2ac' : '#feb2b2'}` }}>
                <span>Test Case {index + 1}: {res.passed ? '✅ Passed' : '❌ Failed'}</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#4a5568' }}>
                  <strong>Status:</strong> {res.status}
                </p>
                {!res.passed && <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#c53030' }}><strong>Output:</strong> {res.output}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Editors */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ height: '70%', borderBottom: '4px solid #ddd' }}>
            <CodeEditor 
              code={myCode}
              onChange={(val) => setMyCode(val || '')}
              language={language}
              setLanguage={setLanguage}
              isReadOnly={!!winner}
            />
          </div>
          <div style={{ height: '30%' }}>
            <CodeEditor 
              code={opponentCode}
              onChange={() => {}} 
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
