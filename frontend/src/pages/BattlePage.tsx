import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import Timer from '../components/Timer';
import '../premium.css';

interface Player { id: string; username: string; }
interface RoomData { roomId: string; players: Player[]; status: 'waiting' | 'active' | 'finished'; winner?: string; }
interface TestResult { passed: boolean; output: string; status: string; }

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

  const [leftWidth, setLeftWidth] = useState(40);
  const [editorHeight, setEditorHeight] = useState(65);
  const isResizingH = useRef(false);
  const isResizingV = useRef(false);

  const sampleProblem = {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: '2 7 11 15\n9', output: '0 1' },
      { input: '3 2 4\n6', output: '1 2' }
    ]
  };

  const startResizingH = () => (isResizingH.current = true);
  const startResizingV = () => (isResizingV.current = true);
  const stopResizing = useCallback(() => {
    isResizingH.current = false;
    isResizingV.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingH.current) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    }
    if (isResizingV.current) {
      const headerHeight = 48;
      const availableHeight = window.innerHeight - headerHeight;
      const newHeight = ((e.clientY - headerHeight) / availableHeight) * 100;
      if (newHeight > 20 && newHeight < 80) setEditorHeight(newHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/room/${roomId}`);
        const data: RoomData = response.data;
        setRoom(data);
        if (data.status === 'active') setStatus('Battle Active');
        else if (data.status === 'finished') {
          setStatus('Match Finished');
          setWinner(data.winner || null);
        } else setStatus('Waiting for Opponent');
      } catch (err) { setSystemError('Failed to load room data'); }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (socket && user && roomId) {
      setIsConnected(socket.connected);
      socket.emit('join_room', { roomId, userId: user.id });
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.on('opponent_joined', () => setStatus('Battle Active'));
      socket.on('code_change', ({ userId, code }: { userId: string, code: string }) => {
        if (userId !== user.id) setOpponentCode(code);
      });
      socket.on('result_update', ({ userId, results }: { userId: string, results: TestResult[] }) => {
        if (userId === user.id) { setTestResults(results); setIsRunning(false); setSystemError(null); }
      });
      socket.on('match_ended', ({ winnerId }: { winnerId: string }) => {
        setWinner(winnerId); setStatus('Match Finished'); setIsRunning(false);
      });
      socket.on('error', ({ message }: { message: string }) => { setSystemError(message); setIsRunning(false); });
      return () => {
        socket.off('connect'); socket.off('disconnect'); socket.off('opponent_joined');
        socket.off('code_change'); socket.off('result_update'); socket.off('match_ended'); socket.off('error');
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
    setIsRunning(true); setTestResults([]); setSystemError(null);
    socket.emit('run_code', { roomId, userId: user.id, code: myCode, language });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      {winner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="minimal-panel" style={{ textAlign: 'center', padding: '48px', width: '360px', backgroundColor: 'var(--panel-bg)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{winner === user?.id ? '🏆' : '💀'}</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{winner === user?.id ? 'Victory' : 'Defeated'}</h2>
            <p style={{ color: 'var(--text-sec)', fontSize: '14px', marginBottom: '32px' }}>{winner === user?.id ? 'You won the battle!' : 'Better luck next time.'}</p>
            <button onClick={() => navigate('/')} className="minimal-button" style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white' }}>Return to Dashboard</button>
          </div>
        </div>
      )}

      <header style={{ height: '48px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', backgroundColor: 'var(--panel-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 }}>CodeSync</h2>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isConnected ? 'var(--success)' : 'var(--danger)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sec)' }}>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-sec)' }}>ROOM: <code>{roomId}</code></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sec)', textTransform: 'uppercase' }}>{status}</span>
          <Timer initialSeconds={1800} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleRunCode} disabled={isRunning || !!winner} className="minimal-button" style={{ height: '32px', padding: '0 12px', fontSize: '12px', backgroundColor: isRunning ? 'var(--border)' : 'var(--primary)', color: 'white' }}>
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button disabled={!!winner} className="minimal-button" style={{ height: '32px', padding: '0 12px', fontSize: '12px', backgroundColor: winner ? 'var(--border)' : 'var(--success)', color: 'white' }}>Submit</button>
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: `${leftWidth}%`, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flexGrow: 1, overflow: 'hidden', padding: '8px 0 8px 8px' }}>
            <ProblemPanel {...sampleProblem} />
          </div>
          <div className="resizer-v" onMouseDown={startResizingV}></div>
          <div style={{ height: `${100 - editorHeight}%`, padding: '0 0 8px 8px', overflowY: 'auto' }}>
            <div className="minimal-panel" style={{ height: '100%', padding: '16px', overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-sec)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>Test Results</h4>
              {systemError && <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{systemError}</div>}
              {testResults.map((res, i) => (
                <div key={i} style={{ marginBottom: '12px', borderBottom: `1px solid var(--border)`, paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Case {i + 1}</span>
                    <span style={{ color: res.passed ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{res.passed ? 'Passed' : 'Failed'}</span>
                  </div>
                  {res.output && <pre style={{ margin: 0, padding: '8px', backgroundColor: '#000', borderRadius: '4px', fontSize: '12px', color: '#888', whiteSpace: 'pre-wrap' }}>{res.output}</pre>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="resizer-h" onMouseDown={startResizingH}></div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '8px' }}>
          <div style={{ height: `${editorHeight}%`, marginBottom: '8px' }}>
            <CodeEditor label="My Solution" code={myCode} onChange={(v) => setMyCode(v || '')} language={language} setLanguage={setLanguage} isReadOnly={!!winner} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <CodeEditor label="Opponent" code={opponentCode} onChange={() => {}} language={language} setLanguage={() => {}} isReadOnly={true} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BattlePage;
