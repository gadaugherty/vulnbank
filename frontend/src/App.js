import React, { useState, useRef, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';
import UserSearch from './components/UserSearch';
import Account from './components/Account';
import Settings from './components/Settings';
import HelpSupport from './components/HelpSupport';
import ChatBubble from './components/ChatBubble';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const handleLogin = (newToken) => setToken(newToken);
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); setPage('dashboard'); };

  useEffect(() => {
    const handleClick = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  let username = 'User';
  try { const p = JSON.parse(atob(token?.split('.')[1])); username = p.user || p.username || 'User'; } catch (e) {}

  const Footer = () => (
    <footer style={{ background: '#fff', borderTop: '1px solid #d0d8e0', marginTop: 60, padding: '30px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
          <div>
            <h3 style={{ color: '#1a3a5c', margin: '0 0 10px 0', fontSize: 16 }}>VulnBank</h3>
            <p style={{ color: '#7a8a9a', margin: 0, fontSize: 13, maxWidth: 280, lineHeight: 1.5 }}>
              A modern banking experience built with security in mind. FDIC insured up to $250,000 per depositor.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 50 }}>
            <div>
              <p style={{ color: '#4a6a8a', fontWeight: 600, fontSize: 13, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Products</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Checking</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Savings & CDs</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Wire Transfers</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Business Banking</p>
            </div>
            <div>
              <p style={{ color: '#4a6a8a', fontWeight: 600, fontSize: 13, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Company</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>About Us</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Careers</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Press</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Contact</p>
            </div>
            <div>
              <p style={{ color: '#4a6a8a', fontWeight: 600, fontSize: 13, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Privacy Policy</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Terms of Service</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Security</p>
              <p style={{ color: '#7a8a9a', fontSize: 13, margin: '6px 0', cursor: 'pointer' }}>Disclosures</p>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e8ecf1', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#9aaaba', fontSize: 12, margin: 0 }}>© 2024 VulnBank, Inc. All rights reserved. Member FDIC. Equal Housing Lender.</p>
          <p style={{ color: '#9aaaba', fontSize: 12, margin: 0 }}>NMLS #1234567</p>
        </div>
      </div>
    </footer>
  );

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8ecf1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ color: '#1a3a5c', fontSize: '2.5em', margin: 0, fontWeight: 700 }}>VulnBank</h1>
            <p style={{ color: '#7a8a9a', fontSize: '1.1em', marginTop: 8 }}>Deliberately vulnerable fintech demo</p>
          </div>
          <Login onLogin={handleLogin} />
        </div>
        <Footer />
        <ChatBubble />
      </div>
    );
  }

  const navBtn = (name, label) => (
    <button onClick={() => setPage(name)} style={{
      marginRight: 4, padding: '10px 22px',
      background: page === name ? '#2c5282' : 'transparent',
      color: page === name ? '#fff' : '#4a6a8a',
      border: 'none', borderRadius: 6, cursor: 'pointer',
      fontSize: 14, fontWeight: page === name ? '600' : 'normal',
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#e8ecf1', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #d0d8e0', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <h1 style={{ color: '#1a3a5c', margin: 0, fontSize: '1.3em', fontWeight: 700, cursor: 'pointer' }} onClick={() => setPage('dashboard')}>VulnBank</h1>
          <div>
            {navBtn('dashboard', 'Dashboard')}
            {navBtn('account', 'Account')}
            {navBtn('transfer', 'Transfer')}
            {navBtn('search', 'Search')}
          </div>
        </div>
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowProfile(!showProfile)} style={{
            width: 36, height: 36, borderRadius: '50%', background: '#2c5282', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {username.charAt(0).toUpperCase()}
          </button>
          {showProfile && (
            <div style={{
              position: 'absolute', top: 44, right: 0, background: '#fff',
              borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              border: '1px solid #d0d8e0', width: 220, zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#1a3a5c' }}>{username}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#7a8a9a' }}>Personal Account</p>
              </div>
              {[
                { label: 'Settings', pg: 'settings' },
                { label: 'Help & Support', pg: 'help' },
              ].map(item => (
                <button key={item.pg} onClick={() => { setPage(item.pg); setShowProfile(false); }}
                  style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#4a6a8a', fontSize: 14 }}>
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #eee' }}>
                <button onClick={handleLogout}
                  style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#c0392b', fontSize: 14 }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: 30, width: '100%', boxSizing: 'border-box' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'account' && <Account />}
        {page === 'transfer' && <Transfer />}
        {page === 'search' && <UserSearch />}
        {page === 'settings' && <Settings username={username} />}
        {page === 'help' && <HelpSupport />}
      </div>
      <Footer />
      <ChatBubble />
    </div>
  );
}

export default App;
