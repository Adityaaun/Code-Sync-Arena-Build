import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { IProblem } from '../types';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import Timer from '../components/Timer';
import '../premium.css';
import '../resizable.css';

interface Player { id: string; username: string; }
interface RoomData { roomId: string; players: Player[]; status: 'waiting' | 'active' | 'finished'; winner?: string; startTime?: string; }
interface TestResult { passed: boolean; output: string; status: string; }

const BattlePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');
  const [myCode, setMyCode] = useState<string>('// Write your code here\n');
  const [opponentCode, setOpponentCode] = useState<string>('// Opponent code will appear here\n');
  const [language, setLanguage] = useState<string>('javascript');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [matchEndReason, setMatchEndReason] = useState<string | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  const BATTLE_DURATION = 1800;

  const calculateTimeLeft = (startTimeStr: string) => {
    const startTime = new Date(startTimeStr).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    return Math.max(0, BATTLE_DURATION - elapsed);
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [leftWidth, setLeftWidth] = useState(() => Number(localStorage.getItem('sync-left-width')) || 40);
  const [editorHeight, setEditorHeight] = useState(() => Number(localStorage.getItem('sync-editor-height')) || 65);
  
  const isResizingH = useRef(false);
  const isResizingV = useRef(false);
  const requestRef = useRef<number | null>(null);

  const startResizingH = useCallback(() => {
    isResizingH.current = true;
    document.body.classList.add('is-resizing');
    document.body.style.cursor = 'col-resize';
  }, []);

  const startResizingV = useCallback(() => {
    isResizingV.current = true;
    document.body.classList.add('is-resizing');
    document.body.style.cursor = 'row-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizingH.current = false;
    isResizingV.current = false;
    document.body.classList.remove('is-resizing');
    document.body.style.cursor = 'default';
    localStorage.setItem('sync-left-width', leftWidth.toString());
    localStorage.setItem('sync-editor-height', editorHeight.toString());
  }, [leftWidth, editorHeight]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    requestRef.current = requestAnimationFrame(() => {
      if (isResizingH.current) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        const minPx = (250 / window.innerWidth) * 100;
        if (newWidth > minPx && newWidth < 70) setLeftWidth(newWidth);
      }
      if (isResizingV.current) {
        const headerHeight = 48;
        const availableHeight = window.innerHeight - headerHeight;
        const newHeight = ((e.clientY - headerHeight) / availableHeight) * 100;
        if (newHeight > 20 && newHeight < 80) setEditorHeight(newHeight);
      }
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLeftWidth(40);
    setEditorHeight(65);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [handleResize, stopResizing]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/room/${roomId}`);
        const data: RoomData = response.data;
        if (data.status === 'active') {
          setStatus('Battle Active');
          if (data.startTime) setTimeLeft(calculateTimeLeft(data.startTime));
        }
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
      socket.on('problem_assigned', (problemData: IProblem) => {
        setProblem(problemData);
        if (problemData.starterCode && problemData.starterCode[language as keyof typeof problemData.starterCode]) {
           setMyCode(problemData.starterCode[language as keyof typeof problemData.starterCode] as string);
        }
      });
      socket.on('opponent_joined', () => {
        setStatus('Battle Active');
        setTimeLeft(BATTLE_DURATION);
      });
      socket.on('code_change', ({ userId, code }: { userId: string, code: string }) => {
        if (userId !== user.id) setOpponentCode(code);
      });
      socket.on('result_update', ({ userId, results }: { userId: string, results: TestResult[] }) => {
        if (userId === user.id) { setTestResults(results); setIsRunning(false); setSystemError(null); }
      });
      socket.on('match_ended', ({ winnerId, reason }: { winnerId: string, reason?: string }) => {
        setWinner(winnerId);
        setMatchEndReason(reason || null);
        setStatus('Match Finished');
        setIsRunning(false);
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

  const handleSubmitCode = () => {
    if (!socket || !user || !roomId || winner || isRunning) return;
    setIsRunning(true); setTestResults([]); setSystemError(null);
    socket.emit('submit_code', { roomId, userId: user.id, code: myCode, language });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      {winner && showOverlay && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="balanced-panel animate-fade" style={{ textAlign: 'center', padding: '48px', width: '360px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{winner === user?.id ? '🏆' : '💀'}</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{winner === user?.id ? 'Victory' : 'Defeated'}</h2>
            <p style={{ color: 'var(--text-sec)', fontSize: '14px', marginBottom: '32px' }}>
              {matchEndReason === 'opponent_left' 
                ? 'Your opponent has left the battle.' 
                : (winner === user?.id ? 'You won the battle!' : 'Better luck next time.')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => setShowOverlay(false)} className="balanced-button" style={{ width: '100%', backgroundColor: 'var(--border)', color: 'white' }}>Review Code</button>
              <button onClick={() => navigate('/')} className="balanced-button" style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white' }}>Return to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ height: '48px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', backgroundColor: 'var(--panel-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>CodeSync</h2>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 'bold' }}>ROOM:</span>
            <span style={{ fontSize: '11px', color: 'white', fontFamily: 'monospace' }}>{roomId}</span>
            <button onClick={copyRoomId} style={{ background: 'none', border: 'none', color: copied ? 'var(--success)' : 'var(--primary)', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', padding: '0 4px' }}>
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isConnected ? 'var(--success)' : 'var(--danger)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sec)' }}>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-sec)', textTransform: 'uppercase' }}>{status}</span>
          <Timer key={timeLeft} initialSeconds={timeLeft || BATTLE_DURATION} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {winner ? (
              <button onClick={() => setShowOverlay(true)} className="balanced-button" style={{ height: '32px', padding: '0 12px', fontSize: '12px', backgroundColor: 'var(--primary)', color: 'white' }}>View Result</button>
            ) : (
              <>
                <button onClick={handleRunCode} disabled={isRunning} className="balanced-button" style={{ height: '32px', padding: '0 12px', fontSize: '12px', backgroundColor: isRunning ? 'var(--border)' : 'var(--primary)', color: 'white' }}>{isRunning ? 'Running...' : 'Run Code'}</button>
                <button onClick={handleSubmitCode} disabled={isRunning} className="balanced-button" style={{ height: '32px', padding: '0 12px', fontSize: '12px', backgroundColor: isRunning ? 'var(--border)' : 'var(--success)', color: 'white' }}>{isRunning ? 'Submitting...' : 'Submit'}</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', width: '100%', margin: 0, padding: 0 }}>
        <div style={{ flex: `0 0 ${leftWidth}%`, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--border)', margin: 0, padding: 0 }}>
          <div style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
            {status === 'Waiting for Opponent' ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px', textAlign: 'center', backgroundColor: 'var(--panel-bg)' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Waiting for Opponent</h3>
                <p style={{ color: 'var(--text-sec)', fontSize: '14px', lineHeight: '1.6' }}>The problem details and timer will be revealed once your opponent enters the arena.</p>
                <div style={{ marginTop: '24px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--primary)' }}>Share Room ID: <strong>{roomId}</strong></div>
              </div>
            ) : (
              problem && <ProblemPanel {...problem} />
            )}
          </div>
          <div className="resizer-v" onMouseDown={startResizingV} onDoubleClick={resetLayout}></div>
          <div style={{ height: `${100 - editorHeight}%`, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
            <div style={{ height: '100%', padding: '16px', overflowY: 'auto', backgroundColor: 'var(--panel-bg)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-sec)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800' }}>Test Results</h4>
              {systemError && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>{systemError}</div>}
              {testResults.map((res, i) => (
                <div key={i} style={{ marginBottom: '12px', borderBottom: `1px solid var(--border)`, paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '500' }}>Case {i + 1}</span>
                    <span style={{ color: res.passed ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{res.passed ? 'Passed' : 'Failed'}</span>
                  </div>
                  {res.output && <pre style={{ margin: 0, padding: '8px', backgroundColor: '#000', borderRadius: '4px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'pre-wrap', border: '1px solid #1e293b' }}>{res.output}</pre>}
                </div>
              ))}
              {!isRunning && testResults.length === 0 && <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '13px', marginTop: '20px' }}>{status === 'Waiting for Opponent' ? 'Awaiting start...' : 'Run your code to see results'}</div>}
            </div>
          </div>
        </div>
        <div className="resizer-h" onMouseDown={startResizingH} onDoubleClick={resetLayout}></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', margin: 0, padding: 0 }}>
          <div style={{ flex: `0 0 ${editorHeight}%`, borderBottom: '1px solid var(--border)' }}>
            <CodeEditor label="My Solution" code={myCode} onChange={(v) => setMyCode(v || '')} language={language} setLanguage={setLanguage} isReadOnly={!!winner || status === 'Waiting for Opponent'} />
          </div>
          <div style={{ flex: 1 }}>
            <CodeEditor label="Opponent" code={opponentCode} onChange={() => {}} language={language} setLanguage={() => {}} isReadOnly={true} isBlurred={!winner && status === 'Battle Active'} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BattlePage;
