import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds, onTimeUp]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (seconds < 60) return '#e53e3e'; // Red
    if (seconds < 300) return '#ed8936'; // Orange
    return '#38a169'; // Green
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '6px 12px',
      backgroundColor: '#f7fafc',
      borderRadius: '20px',
      border: `2px solid ${getColor()}`,
      transition: 'all 0.3s ease'
    }}>
      <span style={{ fontSize: '0.9em', color: '#718096', fontWeight: 'bold' }}>TIME REMAINING</span>
      <span style={{ 
        fontSize: '1.2em', 
        fontFamily: 'monospace',
        fontWeight: 'bold', 
        color: getColor()
      }}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default Timer;
