import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';
import UserSearch from './components/UserSearch';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (newToken) => {
    // VULNERABILITY: Storing JWT in localStorage (CWE-922)
    // Should use httpOnly cookies instead
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <Router>
      <div style={{ fontFamily: 'Arial', maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1>VulnBank</h1>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 15 }}>Home</Link>
          <Link to="/dashboard" style={{ marginRight: 15 }}>Dashboard</Link>
          <Link to="/transfer" style={{ marginRight: 15 }}>Transfer</Link>
          <Link to="/search" style={{ marginRight: 15 }}>Search Users</Link>
          {token && <button onClick={handleLogout}>Logout</button>}
        </nav>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/transfer" element={<Transfer token={token} />} />
          <Route path="/search" element={<UserSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
