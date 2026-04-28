import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../premium.css';

const Dashboard: React.FC = () => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [topic, setTopic] = useState('random');
  const [difficulty, setDifficulty] = useState('random');
  const [error, setError] = useState('');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      const response = await api.post('/room/create', { topic, difficulty });
      navigate(`/battle/${response.data.roomId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomIdInput) return;
    try {
      await api.post(`/room/join/${roomIdInput}`);
      navigate(`/battle/${roomIdInput}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join room');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '12px', color: 'white', letterSpacing: '-0.02em' }}>
          CodeSync Arena
        </h1>
        <p style={{ color: 'var(--text-sec)', fontSize: '18px', fontWeight: '400' }}>
          Real-time coding battles. Build, sync, and compete.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 24px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '32px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '850px' 
      }}>
        <div className="balanced-panel">
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Host a Battle</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-sec)', marginBottom: '6px', textTransform: 'uppercase' }}>Topic</label>
                <select 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'white', outline: 'none' }}
                >
                  <option value="random">Random</option>
                  <option value="array">Arrays</option>
                  <option value="string">Strings</option>
                  <option value="dp">DP</option>
                  <option value="graph">Graphs</option>
                  <option value="math">Math</option>
                  <option value="stack">Stack</option>
                  <option value="queue">Queue</option>
                  <option value="linkedlist">Linked List</option>
                  <option value="recursion">Recursion</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-sec)', marginBottom: '6px', textTransform: 'uppercase' }}>Level</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'white', outline: 'none' }}
                >
                  <option value="random">Random</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreateRoom}
            className="balanced-button"
            style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white' }}
          >
            Create New Battle
          </button>
        </div>

        <div className="balanced-panel">
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Join a Battle</h3>
          <p style={{ color: 'var(--text-sec)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
            Have a Room ID? Paste it below to enter the arena and start the match.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Enter Room ID..." 
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              className="balanced-input"
            />
            <button 
              onClick={handleJoinRoom}
              className="balanced-button"
              style={{ width: '100%', backgroundColor: 'var(--success)', color: 'white' }}
            >
              Enter Arena
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '64px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
        <span style={{ color: 'var(--text-sec)' }}>Authenticated as <strong>{user?.username}</strong></span>
        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
        <button 
          onClick={logout}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', padding: 0 }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
