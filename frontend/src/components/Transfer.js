import React, { useState } from 'react';
import axios from 'axios';
import Card from './Card';

const PAYMENTS_URL = 'http://localhost:8080';

function Transfer() {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    try {
      const res = await axios.post(`${PAYMENTS_URL}/transfer`, {
        from_account: fromAccount,
        to_account: toAccount,
        amount: parseFloat(amount),
        description: description,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    }
  };

  const inputStyle = { width: '100%', padding: 12, background: '#f4f6f8', border: '1px solid #d0d8e0', borderRadius: 6, color: '#1a3a5c', fontSize: 15, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: 6, color: '#5a6a7a', fontSize: 13, fontWeight: 600 };

  return (
    <div>
      <h2 style={{ color: '#1a3a5c', marginBottom: 5 }}>Transfer Funds</h2>
      <p style={{ color: '#7a8a9a', marginTop: 0 }}>Send money between accounts</p>

      <Card>
        <form onSubmit={handleTransfer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>From Account</label>
              <input type="text" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} placeholder="XXXX-XXXX-XXXX" style={{ ...inputStyle, fontFamily: "'Outfit', sans-serif" }} />
            </div>
            <div>
              <label style={labelStyle}>To Account</label>
              <input type="text" value={toAccount} onChange={(e) => setToAccount(e.target.value)} placeholder="XXXX-XXXX-XXXX" style={{ ...inputStyle, fontFamily: "'Outfit', sans-serif" }} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Amount ($)</label>
            <input className="mono" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ ...inputStyle, fontSize: 22 }} />
          </div>
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Payment for..." style={inputStyle} />
          </div>
          <button type="submit" style={{ width: '100%', padding: 14, background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: '600' }}>
            Send Transfer
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 20, padding: 15, background: '#f4f6f8', borderRadius: 8, border: '1px solid #d0d8e0' }}>
            <p style={{ color: '#1a3a5c', margin: 0, fontWeight: 600 }}>{result.message}</p>
            {result.tx_id && <p className="mono" style={{ color: '#7a8a9a', margin: '5px 0 0 0', fontSize: 13 }}>Transaction ID: #{String(result.tx_id).padStart(6, '0')}</p>}
          </div>
        )}
        {error && (
          <div style={{ marginTop: 20, padding: 15, background: '#fdf2f2', borderRadius: 8, border: '1px solid #e8c4c4' }}>
            <p style={{ color: '#c0392b', margin: 0 }}>{error}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Transfer;
