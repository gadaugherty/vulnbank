import React, { useState } from 'react';
import axios from 'axios';
import Card from './Card';

const API_URL = 'http://localhost:5000';

function UserSearch() {
  const [searchId, setSearchId] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setUserData(null);
    if (!searchId.trim()) { setError('Please enter a user ID'); return; }
    try {
      const res = await axios.get(`${API_URL}/user/${searchId}`);
      if (res.data) setUserData(res.data);
      else setError('User not found');
    } catch (err) {
      if (err.response?.status === 404) setError('No account found matching that ID');
      else setError(err.response?.data?.error || 'Unable to complete search');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#1a3a5c', marginBottom: 5 }}>Search Users</h2>
      <p style={{ color: '#7a8a9a', marginTop: 0 }}>Look up account details by user ID</p>

      <Card style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <input type="text" placeholder="Enter user ID" value={searchId} onChange={(e) => setSearchId(e.target.value)}
            style={{ flex: 1, padding: 12, background: '#f4f6f8', border: '1px solid #d0d8e0', borderRadius: 6, color: '#1a3a5c', fontSize: 15, outline: 'none' }} />
          <button type="submit" style={{ padding: '12px 25px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15, fontWeight: '600' }}>
            Search
          </button>
        </form>
      </Card>

      {error && (
        <Card>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ color: '#c0392b', fontSize: 16, margin: 0 }}>{error}</p>
          </div>
        </Card>
      )}

      {userData && (
        <Card>
          <h3 style={{ color: '#1a3a5c', marginTop: 0 }}>Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <p style={{ color: '#7a8a9a', margin: '0 0 4px 0', fontSize: 12, textTransform: 'uppercase' }}>Account Number</p>
              <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 16 }}>{userData.account_number || '—'}</p>
            </div>
            <div>
              <p style={{ color: '#7a8a9a', margin: '0 0 4px 0', fontSize: 12, textTransform: 'uppercase' }}>Username</p>
              <p style={{ color: '#1a3a5c', margin: 0, fontSize: 16, fontWeight: 600 }}>{userData.username}</p>
            </div>
            <div>
              <p style={{ color: '#7a8a9a', margin: '0 0 4px 0', fontSize: 12, textTransform: 'uppercase' }}>Email</p>
              <p style={{ color: '#1a3a5c', margin: 0, fontSize: 16 }}>{userData.email || '—'}</p>
            </div>
            <div>
              <p style={{ color: '#7a8a9a', margin: '0 0 4px 0', fontSize: 12, textTransform: 'uppercase' }}>Balance</p>
              <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 16, fontWeight: 600 }}>${parseFloat(userData.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default UserSearch;
