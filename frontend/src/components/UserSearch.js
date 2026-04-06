import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserSearch() {
  const [searchId, setSearchId] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/user/${encodeURIComponent(searchId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
      setError('');
    } catch (err) {
      setUserData(null);
      setError(err.response?.data?.error || 'User not found');
    }
  };

  return (
    <div>
      <h2>Search Users</h2>
      <form onSubmit={handleSearch}>
        <input
          type="number"
          placeholder="Enter User ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ marginBottom: 10, padding: 8, width: 250 }}
        />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userData && (
        <div style={{ marginTop: 20, padding: 15, border: '1px solid #ccc' }}>
          <p><strong>ID:</strong> {userData.id}</p>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          {/* FIX: No dangerouslySetInnerHTML — use text content */}
          <p><strong>Balance:</strong> ${userData.balance}</p>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
