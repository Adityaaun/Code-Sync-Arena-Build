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
      backgroundColor: 'var(--bg-dark)',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: 'white' }}>
          CodeSync Arena
        </h1>
        <p style={{ color: 'var(--text-sec)', fontSize: '14px', marginBottom: '32px' }}>
          Real-time coding battles for developers.
        </p>

        {error && (
          <div style={{ padding: '10px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div className="minimal-panel" style={{ padding: '24px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <button 
              onClick={handleCreateRoom}
              className="minimal-button"
              style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white' }}
            >
              Create New Battle
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '24px' }}></div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-sec)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Join existing battle</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Room ID" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="minimal-input"
                style={{ flexGrow: 1 }}
              />
              <button 
                onClick={handleJoinRoom}
                className="minimal-button"
                style={{ backgroundColor: 'var(--success)', color: 'white' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-sec)' }}>{user?.username}</span>
          <div style={{ width: '1px', height: '12px', backgroundColor: 'var(--border)' }}></div>
          <button 
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
