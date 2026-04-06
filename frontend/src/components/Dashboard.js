import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';
const PAYMENTS_URL = 'http://localhost:8080';

function Dashboard({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // VULNERABILITY: No auth header sent, endpoints don't require auth anyway (CWE-306)
    axios.get(`${PAYMENTS_URL}/transactions`).then(res => {
      setTransactions(res.data || []);
    });
    // VULNERABILITY: Fetches all users including passwords (CWE-200)
    axios.get(`${API_URL}/users`).then(res => {
      setUsers(res.data || []);
    });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <h3>Users</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr><th>ID</th><th>Username</th><th>Email</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Recent Transactions</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr><th>ID</th><th>From</th><th>To</th><th>Amount</th><th>Description</th></tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.from_user_id}</td>
              <td>{t.to_user_id}</td>
              <td>${t.amount}</td>
              <td>{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
