import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      setError('');
      if (onLogin) onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ width: 380, padding: 35, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #d0d8e0' }}>
      <h2 style={{ marginTop: 0, color: '#1a3a5c', textAlign: 'center', marginBottom: 25 }}>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#5a6a7a', fontSize: 13, fontWeight: 600 }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: 12, background: '#f4f6f8', border: '1px solid #d0d8e0', borderRadius: 6, color: '#1a3a5c', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            placeholder="Enter username" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#5a6a7a', fontSize: 13, fontWeight: 600 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, background: '#f4f6f8', border: '1px solid #d0d8e0', borderRadius: 6, color: '#1a3a5c', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            placeholder="Enter password" />
        </div>
        {error && <p style={{ color: '#c0392b', margin: '0 0 15px 0', fontSize: 14, textAlign: 'center' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 14, background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: '600', marginBottom: 15 }}>
          Sign In
        </button>
        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={() => setShowForgot(!showForgot)}
            style={{ background: 'none', border: 'none', color: '#2c5282', cursor: 'pointer', fontSize: 13 }}>
            Forgot your password?
          </button>
          {showForgot && (
            <p style={{ color: '#5a6a7a', fontSize: 12, marginTop: 10, padding: 10, background: '#f4f6f8', borderRadius: 6 }}>
              Contact your administrator to reset your password.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Login;
