import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../premium.css';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="balanced-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>Create Account</h2>
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="balanced-input"
              placeholder="johndoe"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="balanced-input"
              placeholder="name@example.com"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="balanced-input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="balanced-button" style={{ width: '100%', backgroundColor: 'var(--success)', color: 'white' }}>
            Create Arena Account
          </button>
        </form>
        
        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-sec)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

