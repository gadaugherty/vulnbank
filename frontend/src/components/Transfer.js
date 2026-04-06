import React, { useState } from 'react';
import axios from 'axios';

const PAYMENTS_URL = 'http://localhost:8080';

function Transfer({ token }) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      // VULNERABILITY: No auth token sent (CWE-306)
      // VULNERABILITY: No CSRF protection (CWE-352)
      // VULNERABILITY: Allows specifying any from_user_id — IDOR (CWE-639)
      const res = await axios.post(`${PAYMENTS_URL}/transfer`, {
        from_user_id: parseInt(fromId),
        to_user_id: parseInt(toId),
        amount: parseFloat(amount),
        description: description,
      });
      setResult(res.data.message);
    } catch (err) {
      setResult(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h2>Transfer Funds</h2>
      <form onSubmit={handleTransfer}>
        <div>
          <input type="number" placeholder="From User ID" value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            style={{ marginBottom: 10, padding: 8, width: 250 }} />
        </div>
        <div>
          <input type="number" placeholder="To User ID" value={toId}
            onChange={(e) => setToId(e.target.value)}
            style={{ marginBottom: 10, padding: 8, width: 250 }} />
        </div>
        <div>
          <input type="number" step="0.01" placeholder="Amount" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginBottom: 10, padding: 8, width: 250 }} />
        </div>
        <div>
          <input type="text" placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginBottom: 10, padding: 8, width: 250 }} />
        </div>
        <button type="submit">Send Transfer</button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
}

export default Transfer;
