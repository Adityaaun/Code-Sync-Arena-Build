import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BattlePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [status, setStatus] = useState('Joining...');

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
    <div style={{ padding: '20px' }}>
      <h2>Room ID: {roomId}</h2>
      <h3>Status: {status}</h3>
      {room && (
        <div>
          <p>Players: {room.players.map((p: any) => p.username).join(' vs ')}</p>
        </div>
      )}
      <div style={{ marginTop: '20px', border: '1px solid #ccc', height: '400px', padding: '10px' }}>
        <p>(Editor will be placed here in Phase 3)</p>
      </div>
    </div>
  );
};

export default BattlePage;
