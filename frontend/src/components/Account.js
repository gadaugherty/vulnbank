import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
import { maskAccount } from '../utils';

const API_URL = 'http://localhost:5000';
const PAYMENTS_URL = 'http://localhost:8080';

function Account() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = 1;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.user_id || payload.sub || 1;
    } catch (e) {}

    axios.get(`${API_URL}/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => setUser(res.data)).catch(() => {
      axios.get(`${API_URL}/user/${userId}`).then(res => setUser(res.data)).catch(() => setError('Could not load account'));
    });

    axios.get(`${PAYMENTS_URL}/transactions`).then(res => setTransactions(res.data || [])).catch(() => {});
  }, []);

  const balance = user ? parseFloat(user.balance || 0) : 0;
  const checkingBalance = balance * 0.7;
  const savingsBalance = balance * 0.3;

  const tabStyle = (tab) => ({
    padding: '10px 24px', cursor: 'pointer', fontSize: 14, marginRight: 4,
    background: activeTab === tab ? '#2c5282' : '#fff',
    color: activeTab === tab ? '#fff' : '#4a6a8a',
    border: activeTab === tab ? 'none' : '1px solid #d0d8e0',
    borderRadius: '8px 8px 0 0',
    fontWeight: activeTab === tab ? '600' : 'normal',
  });

  const th = { color: '#7a8a9a', textAlign: 'left', padding: '10px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 };
  const td = { color: '#4a5a6a', padding: '10px 12px' };

  return (
    <div>
      <h2 style={{ color: '#1a3a5c', marginBottom: 5 }}>Account</h2>
      <p style={{ color: '#7a8a9a', marginTop: 0 }}>Welcome back, {user?.username || 'User'}</p>

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 16, marginBottom: 25 }}>
        <Card style={{ flex: 1 }}>
          <p style={{ color: '#7a8a9a', margin: '0 0 8px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Total Balance</p>
          <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 28, fontWeight: 700 }}>${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </Card>
        <Card style={{ flex: 1 }}>
          <p style={{ color: '#7a8a9a', margin: '0 0 8px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Checking</p>
          <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 28, fontWeight: 700 }}>${checkingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </Card>
        <Card style={{ flex: 1 }}>
          <p style={{ color: '#7a8a9a', margin: '0 0 8px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Savings & CDs</p>
          <p className="mono" style={{ color: '#1a3a5c', margin: 0, fontSize: 28, fontWeight: 700 }}>${savingsBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </Card>
      </div>

      <div>
        <button style={tabStyle('checking')} onClick={() => setActiveTab('checking')}>Checking</button>
        <button style={tabStyle('savings')} onClick={() => setActiveTab('savings')}>Savings & CDs</button>
        <button style={tabStyle('history')} onClick={() => setActiveTab('history')}>Transaction History</button>
      </div>

      <div style={{ background: '#fff', borderRadius: '0 10px 10px 10px', border: '1px solid #d0d8e0', overflow: 'hidden' }}>
        <div style={{ height: 4, background: '#2c5282' }} />
        <div style={{ padding: 25, minHeight: 180 }}>
          {activeTab === 'checking' && (
            <div>
              <h3 style={{ color: '#1a3a5c', marginTop: 0 }}>Checking Account</h3>
              <p className="mono" style={{ color: '#1a3a5c', fontSize: 26, fontWeight: 700 }}>${checkingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              <p style={{ color: '#7a8a9a' }}>Account: <span className="mono">{user?.account_number || '****-****-****'}</span></p>
              <p style={{ color: '#7a8a9a' }}>Routing: <span className="mono">021000089</span></p>
              <p style={{ color: '#7a8a9a', fontSize: 13 }}>Available for transfers and payments</p>
            </div>
          )}
          {activeTab === 'savings' && (
            <div>
              <h3 style={{ color: '#1a3a5c', marginTop: 0 }}>Savings & CDs</h3>
              <p className="mono" style={{ color: '#1a3a5c', fontSize: 26, fontWeight: 700 }}>${savingsBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              <p style={{ color: '#7a8a9a' }}>Account: <span className="mono">{maskAccount(user?.account_number)}</span></p>
              <p style={{ color: '#7a8a9a' }}>APY: <span className="mono">4.25%</span></p>
              <p style={{ color: '#7a8a9a', fontSize: 13 }}>6 withdrawals per month limit</p>
            </div>
          )}
          {activeTab === 'history' && (
            <div>
              <h3 style={{ color: '#1a3a5c', marginTop: 0 }}>Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p style={{ color: '#7a8a9a' }}>No transactions yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e8ecf1' }}>
                      <th style={th}>From</th>
                      <th style={th}>To</th>
                      <th style={th}>Description</th>
                      <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                        <td style={td}><span className="mono" style={{ fontSize: 12 }}>{tx.from_account}</span></td>
                        <td style={td}><span className="mono" style={{ fontSize: 12 }}>{tx.to_account}</span></td>
                        <td style={td}>{tx.description || '—'}</td>
                        <td className="mono" style={{ ...td, color: '#1a3a5c', textAlign: 'right', fontWeight: 600 }}>${tx.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
