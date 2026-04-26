import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../premium.css';

const Dashboard: React.FC = () => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [error, setError] = useState('');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      const response = await api.post('/room/create');
      navigate(`/battle/${response.data.roomId}`);
    } catch (err: any) {
      setError('Failed to create room');
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
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
      padding: '20px'
    }}>
      <div className="animate-fade" style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5em', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CodeSync Arena
        </h1>
        <p style={{ color: 'var(--text-sec)', fontSize: '1.2em', marginBottom: '50px' }}>
          Real-time coding battles. Prove your skills against the world.
        </p>

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '40px', alignItems: 'center' }}>
          {/* Create Card */}
          <div className="premium-card" style={{ padding: '40px' }}>
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>⚔️</div>
            <h3 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Start a Battle</h3>
            <p style={{ color: 'var(--text-sec)', marginBottom: '30px', fontSize: '0.9em' }}>
              Create a private room and invite an opponent to compete.
            </p>
            <button 
              onClick={handleCreateRoom}
              className="premium-button"
              style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary)', color: 'white' }}
            >
              Create Battle
            </button>
          </div>

          <div style={{ height: '200px', backgroundColor: 'var(--border)' }}></div>

          {/* Join Card */}
          <div className="premium-card" style={{ padding: '40px' }}>
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>🔗</div>
            <h3 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Join Battle</h3>
            <p style={{ color: 'var(--text-sec)', marginBottom: '30px', fontSize: '0.9em' }}>
              Enter a Room ID to join an existing coding battle.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter Room ID" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                style={{ 
                  padding: '14px', 
                  backgroundColor: 'var(--panel-light)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleJoinRoom}
                className="premium-button"
                style={{ width: '100%', padding: '15px', backgroundColor: 'var(--success)', color: 'white' }}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: 'var(--text-sec)' }}>Signed in as <strong>{user?.username}</strong></span>
          <button 
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
