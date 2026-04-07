import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';

const API_URL = 'http://localhost:5000';
const PAYMENTS_URL = 'http://localhost:8080';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get(`${PAYMENTS_URL}/transactions`).then(res => setTransactions(res.data || [])).catch(() => {});
    axios.get(`${API_URL}/users`).then(res => setUsers(res.data || [])).catch(() => {});
  }, []);

  const th = { color: '#7a8a9a', textAlign: 'left', padding: '10px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 };
  const td = { color: '#4a5a6a', padding: '10px 12px' };

  return (
    <div>
      <h2 style={{ color: '#1a3a5c', marginBottom: 5 }}>Dashboard</h2>
      <p style={{ color: '#7a8a9a', marginTop: 0 }}>Overview of all accounts and activity</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 25 }}>
        <Card style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: '#7a8a9a', margin: '0 0 5px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Total Users</p>
          <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 32, fontWeight: 700 }}>{users.length}</p>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: '#7a8a9a', margin: '0 0 5px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Transactions</p>
          <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 32, fontWeight: 700 }}>{transactions.length}</p>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: '#7a8a9a', margin: '0 0 5px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Total Volume</p>
          <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 32, fontWeight: 700 }}>${transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </Card>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 15 }}>Users</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8ecf1' }}>
                <th style={th}>Account</th>
                <th style={th}>Username</th>
                <th style={th}>Email</th>
                <th style={th}>Password</th>
                <th style={{ ...th, textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                  <td style={td}><span className="mono" style={{ fontSize: 13 }}>{u.account_number || '—'}</span></td>
                  <td style={{ ...td, color: '#1a3a5c', fontWeight: 600 }}>{u.username}</td>
                  <td style={td}>{u.email || '—'}</td>
                  <td style={td}><span className="mono" style={{ fontSize: 13 }}>{u.password || '—'}</span></td>
                  <td className="mono" style={{ ...td, color: '#1a3a5c', textAlign: 'right', fontWeight: 600 }}>${parseFloat(u.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 15 }}>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p style={{ color: '#7a8a9a' }}>No transactions yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8ecf1' }}>
                <th style={th}>From</th>
                <th style={th}>To</th>
                <th style={th}>Description</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                  <td style={td}><span className="mono" style={{ fontSize: 12 }}>{tx.from_account}</span></td>
                  <td style={td}><span className="mono" style={{ fontSize: 12 }}>{tx.to_account}</span></td>
                  <td style={td}>{tx.description || '—'}</td>
                  <td style={td}><span style={{ padding: '2px 8px', background: '#edf2f7', borderRadius: 4, fontSize: 12, color: '#4a6a8a' }}>{tx.status}</span></td>
                  <td className="mono" style={{ ...td, color: '#1a3a5c', textAlign: 'right', fontWeight: 600 }}>${tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
