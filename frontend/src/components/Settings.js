import React, { useState } from 'react';
import Card from './Card';

function Settings({ username }) {
  const [displayName, setDisplayName] = useState(username || '');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState('');

  const inputStyle = { width: '100%', padding: 12, background: '#f4f6f8', border: '1px solid #d0d8e0', borderRadius: 6, color: '#1a3a5c', fontSize: 15, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: 6, color: '#5a6a7a', fontSize: 13, fontWeight: 600 };

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  return (
    <div>
      <h2 style={{ color: '#1a3a5c', marginBottom: 5 }}>Settings</h2>
      <p style={{ color: '#7a8a9a', marginTop: 0 }}>Manage your account preferences</p>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 20 }}>Profile Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => handleSave('profile')} style={{ padding: '10px 24px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Save Changes
          </button>
          {saved === 'profile' && <span style={{ color: '#2c5282', fontSize: 14 }}>Saved</span>}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 20 }}>Change Password</h3>
        <div style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => handleSave('password')} style={{ padding: '10px 24px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Update Password
          </button>
          {saved === 'password' && <span style={{ color: '#2c5282', fontSize: 14 }}>Updated</span>}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 15 }}>Notifications</h3>
        {[
          { label: 'Email notifications for transactions', defaultChecked: true },
          { label: 'SMS alerts for large transfers', defaultChecked: true },
          { label: 'Weekly account summary', defaultChecked: false },
          { label: 'Marketing and promotional emails', defaultChecked: false },
        ].map((item, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', color: '#4a5a6a', fontSize: 14 }}>
            <input type="checkbox" defaultChecked={item.defaultChecked} style={{ width: 16, height: 16, accentColor: '#2c5282' }} />
            {item.label}
          </label>
        ))}
      </Card>

      <Card>
        <h3 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 15 }}>Security</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
          <div>
            <p style={{ color: '#1a3a5c', margin: 0, fontWeight: 600, fontSize: 14 }}>Two-Factor Authentication</p>
            <p style={{ color: '#7a8a9a', margin: '4px 0 0 0', fontSize: 13 }}>Add an extra layer of security to your account</p>
          </div>
          <button style={{ padding: '8px 18px', background: '#f4f6f8', color: '#2c5282', border: '1px solid #d0d8e0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Enable
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
          <div>
            <p style={{ color: '#1a3a5c', margin: 0, fontWeight: 600, fontSize: 14 }}>Active Sessions</p>
            <p style={{ color: '#7a8a9a', margin: '4px 0 0 0', fontSize: 13 }}>Manage devices logged into your account</p>
          </div>
          <button style={{ padding: '8px 18px', background: '#f4f6f8', color: '#2c5282', border: '1px solid #d0d8e0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            View
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div>
            <p style={{ color: '#c0392b', margin: 0, fontWeight: 600, fontSize: 14 }}>Delete Account</p>
            <p style={{ color: '#7a8a9a', margin: '4px 0 0 0', fontSize: 13 }}>Permanently delete your account and all data</p>
          </div>
          <button style={{ padding: '8px 18px', background: '#fdf2f2', color: '#c0392b', border: '1px solid #e8c4c4', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Delete
          </button>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
