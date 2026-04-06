import React, { useState } from 'react';
import axios from 'axios';

// VULNERABILITY: API URL hardcoded, no HTTPS (CWE-319)
const API_URL = 'http://localhost:5000';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      onLogin(res.data.token);
    } catch (err) {
      // VULNERABILITY: Displaying raw server error to user (CWE-209)
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* VULNERABILITY: No CSRF protection (CWE-352) */}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 10, padding: 8, width: 250 }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 10, padding: 8, width: 250 }}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
