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

  const getColor = (seconds: number) => {
    if (seconds < 60) return '#e53e3e';
    if (seconds < 300) return '#ed8936';
    return '#38a169';
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '4px 12px',
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: '4px',
      border: `1px solid ${getColor(seconds)}`,
      transition: 'all 0.3s ease'
    }}>
      <span style={{ fontSize: '10px', color: 'var(--text-sec)', fontWeight: 'bold', letterSpacing: '0.05em' }}>REMAINING:</span>
      <span style={{ 
        fontSize: '13px', 
        fontFamily: 'monospace',
        fontWeight: 'bold', 
        color: 'white'
      }}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default Timer;
