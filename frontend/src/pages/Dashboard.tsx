import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>CodeSync Arena</h1>
      <p>Welcome, {user?.username}!</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Create a Battle</h3>
        <button 
          onClick={handleCreateRoom}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Create New Room
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Join a Battle</h3>
        <input 
          type="text" 
          placeholder="Enter Room ID" 
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          style={{ padding: '10px', width: '200px', marginRight: '10px' }}
        />
        <button 
          onClick={handleJoinRoom}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Join Room
        </button>
      </div>

      <button 
        onClick={logout}
        style={{ marginTop: '40px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
