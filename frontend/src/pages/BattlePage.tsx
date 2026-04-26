import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  winner?: string;
}

interface TestResult {
  passed: boolean;
  output: string;
  status: string;
}

const BattlePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');
  const [myCode, setMyCode] = useState<string>('// Write your code here\n');
  const [opponentCode, setOpponentCode] = useState<string>('// Opponent code will appear here\n');
  const [language, setLanguage] = useState<string>('javascript');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

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
        const data: RoomData = response.data;
        setRoom(data);
        if (data.status === 'active') {
          setStatus('Battle Active');
        } else if (data.status === 'finished') {
          setStatus('Match Finished');
          setWinner(data.winner || null);
        } else {
          setStatus('Waiting for Opponent');
        }
      } catch (err) {
        setSystemError('Failed to load room data');
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (socket && user && roomId) {
      setIsConnected(socket.connected);
      socket.emit('join_room', { roomId, userId: user.id });

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      socket.on('opponent_joined', () => {
        setStatus('Battle Active');
      });

      socket.on('code_change', ({ userId, code }: { userId: string, code: string }) => {
        if (userId !== user.id) {
          setOpponentCode(code);
        }
      });

      socket.on('result_update', ({ userId, results }: { userId: string, results: TestResult[] }) => {
        if (userId === user.id) {
          setTestResults(results);
          setIsRunning(false);
          setSystemError(null);
        }
      });

      socket.on('match_ended', ({ winnerId }: { winnerId: string }) => {
        setWinner(winnerId);
        setStatus('Match Finished');
        setIsRunning(false);
      });

      socket.on('error', ({ message }: { message: string }) => {
        setSystemError(message);
        setIsRunning(false);
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('opponent_joined');
        socket.off('code_change');
        socket.off('result_update');
        socket.off('match_ended');
        socket.off('error');
      };
    }
  }, [socket, user, roomId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (socket && user && roomId && !winner && myCode !== '// Write your code here\n') {
        socket.emit('code_change', { roomId, userId: user.id, code: myCode });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [myCode, socket, user, roomId, winner]);

  const handleRunCode = () => {
    if (!socket || !user || !roomId || winner || isRunning) return;
    setIsRunning(true);
    setTestResults([]);
    setSystemError(null);
    socket.emit('run_code', { roomId, userId: user.id, code: myCode, language });
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f1f5f9'
    }}>
      {/* Winner Overlay */}
      {winner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, color: 'white',
          backdropFilter: 'blur(4px)', transition: 'all 0.5s ease'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: '#1e293b', 
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #334155'
          }}>
            <h1 style={{ fontSize: '4em', marginBottom: '10px' }}>
              {winner === user?.id ? '🏆' : '💀'}
            </h1>
            <h2 style={{ fontSize: '2.5em', marginBottom: '30px', fontWeight: 'bold' }}>
              {winner === user?.id ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
              {winner === user?.id ? 'You solved the problem first!' : 'Better luck next time!'}
            </p>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                padding: '12px 32px', 
                fontSize: '1.1em', 
                cursor: 'pointer', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: '#3b82f6', 
                color: 'white',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        padding: '12px 24px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#fff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1em' }}>CodeSync Arena</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isConnected ? '#10b981' : '#ef4444' 
              }}></div>
              <span style={{ fontSize: '0.75em', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div style={{ height: '30px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
          <div>
            <span style={{ fontSize: '0.75em', color: '#94a3b8', display: 'block' }}>ROOM ID</span>
            <code style={{ fontSize: '0.9em', color: '#475569', fontWeight: 'bold' }}>{roomId}</code>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75em', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>STATUS</span>
            <span style={{ 
              fontSize: '0.85em', 
              fontWeight: 'bold', 
              color: status.includes('Active') ? '#3b82f6' : '#64748b',
              backgroundColor: status.includes('Active') ? '#eff6ff' : '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {status.toUpperCase()}
            </span>
          </div>
          <Timer initialSeconds={1800} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleRunCode}
              disabled={isRunning || !!winner}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isRunning || winner ? '#94a3b8' : '#3b82f6', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: (isRunning || winner) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => !isRunning && !winner && (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => !isRunning && !winner && (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              {isRunning && <span className="loader"></span>}
              {isRunning ? 'RUNNING...' : 'RUN CODE'}
            </button>
            <button 
              disabled={!!winner}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: winner ? '#94a3b8' : '#10b981', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: winner ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => !winner && (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseOut={(e) => !winner && (e.currentTarget.style.backgroundColor = '#10b981')}
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', padding: '16px', gap: '16px' }}>
        {/* Left Panel: Problem & Results */}
        <div style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <ProblemPanel 
              title={sampleProblem.title}
              description={sampleProblem.description}
              examples={sampleProblem.examples}
            />
          </div>
          
          {/* Results Section */}
          <div style={{ 
            height: '35%', 
            padding: '20px', 
            backgroundColor: '#fff', 
            overflowY: 'auto',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Execution Results</h4>
            
            {systemError && (
              <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9em' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>System Error</strong>
                {systemError}
              </div>
            )}

            {testResults.length === 0 && !isRunning && !systemError && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                <p>Run your code to see test results here.</p>
              </div>
            )}
            
            {isRunning && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>Executing test cases on Judge0...</p>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {testResults.map((res, index) => (
                <div key={index} style={{ 
                  padding: '16px', 
                  borderRadius: '6px', 
                  backgroundColor: res.passed ? '#f0fdf4' : '#fef2f2', 
                  border: `1px solid ${res.passed ? '#bbf7d0' : '#fecaca'}` 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#1e293b' }}>Test Case {index + 1}</strong>
                    <span style={{ 
                      color: res.passed ? '#16a34a' : '#dc2626', 
                      fontWeight: 'bold',
                      fontSize: '0.9em',
                      backgroundColor: res.passed ? '#dcfce7' : '#fee2e2',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {res.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85em' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#64748b' }}><strong>Status:</strong> {res.status}</p>
                    {res.output && res.output !== 'No output' && (
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#475569', fontSize: '0.9em' }}>Output</strong>
                        <pre style={{ 
                          marginTop: '4px', 
                          padding: '10px', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px', 
                          whiteSpace: 'pre-wrap', 
                          fontSize: '0.9em', 
                          border: '1px solid #e2e8f0',
                          color: res.passed ? '#1e293b' : '#dc2626',
                          maxHeight: '150px',
                          overflowY: 'auto'
                        }}>{res.output}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Editors */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
          <div style={{ height: '65%' }}>
            <CodeEditor 
              code={myCode}
              onChange={(val) => setMyCode(val || '')}
              language={language}
              setLanguage={setLanguage}
              isReadOnly={!!winner}
              label="My Code"
            />
          </div>
          <div style={{ height: '35%' }}>
            <CodeEditor 
              code={opponentCode}
              onChange={() => {}} 
              language={language}
              setLanguage={() => {}}
              isReadOnly={true}
              label="Opponent's Code"
            />
          </div>
        </div>
      </div>
      
      <style>{`
        .loader {
          width: 16px;
          height: 16px;
          border: 2px solid #FFF;
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BattlePage;
