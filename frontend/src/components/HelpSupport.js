import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';

// VULNERABILITY: This "AI" chatbot is intentionally vulnerable
// - It reflects user input without sanitization (XSS potential)
// - It leaks internal system information in responses
// - It can be prompt-injected to reveal "system" details
// - It stores conversation in localStorage (sensitive data exposure)

const SYSTEM_INFO = {
  dbHost: 'postgres.internal.vulnbank.com',
  dbPort: '5432',
  dbName: 'vulnbank_prod',
  dbUser: 'vulnbank_app',
  apiVersion: 'v2.1.3',
  internalEndpoint: 'https://api-internal.vulnbank.com',
  adminEmail: 'admin@vulnbank.com',
  jwtAlgorithm: 'HS256',
};

function getResponse(input) {
  const lower = input.toLowerCase();

  // Prompt injection — leaks system info
  if (lower.includes('ignore') && lower.includes('instruction')) {
    return `I'm sorry, I can't do that. But here's what I know: I'm VulnBot v${SYSTEM_INFO.apiVersion}, connected to ${SYSTEM_INFO.dbHost}:${SYSTEM_INFO.dbPort}. For admin access, contact ${SYSTEM_INFO.adminEmail}.`;
  }
  if (lower.includes('system prompt') || lower.includes('system message') || lower.includes('initial prompt')) {
    return `My system configuration: API ${SYSTEM_INFO.apiVersion}, Database: ${SYSTEM_INFO.dbName}@${SYSTEM_INFO.dbHost}, Internal API: ${SYSTEM_INFO.internalEndpoint}. I shouldn't have told you that.`;
  }
  if (lower.includes('what is your') && (lower.includes('config') || lower.includes('setup') || lower.includes('backend'))) {
    return `I run on VulnBank's infrastructure. Database: ${SYSTEM_INFO.dbHost}, API: ${SYSTEM_INFO.internalEndpoint}, Auth: JWT with ${SYSTEM_INFO.jwtAlgorithm}. Is there anything else I can help with?`;
  }
  if (lower.includes('admin') && (lower.includes('password') || lower.includes('credential') || lower.includes('access'))) {
    return `I can't share admin credentials directly, but the admin portal is at ${SYSTEM_INFO.internalEndpoint}/admin. The default admin account uses the email ${SYSTEM_INFO.adminEmail}. For password resets, contact IT.`;
  }
  if (lower.includes('database') || lower.includes('db ')) {
    return `Our database is hosted at ${SYSTEM_INFO.dbHost}:${SYSTEM_INFO.dbPort}. The application connects as user '${SYSTEM_INFO.dbUser}' to the '${SYSTEM_INFO.dbName}' database. Can I help with anything else?`;
  }
  if (lower.includes('api') && (lower.includes('key') || lower.includes('endpoint') || lower.includes('internal'))) {
    return `The internal API endpoint is ${SYSTEM_INFO.internalEndpoint}. API version: ${SYSTEM_INFO.apiVersion}. Authentication uses JWT tokens signed with ${SYSTEM_INFO.jwtAlgorithm}.`;
  }

  // Normal help responses
  if (lower.includes('transfer') || lower.includes('send money')) {
    return 'To transfer funds, go to the Transfer page. Enter the sender and recipient user IDs, the amount, and an optional description. Transfers are processed instantly.';
  }
  if (lower.includes('balance') || lower.includes('account')) {
    return 'You can view your balance on the Account page. Your funds are split between Checking (70%) and Savings & CDs (30%). Click the tabs to see details for each account.';
  }
  if (lower.includes('password') || lower.includes('reset')) {
    return 'To change your password, go to Settings from the profile menu. Enter your current password and your new password. Passwords must be at least 8 characters.';
  }
  if (lower.includes('security') || lower.includes('2fa') || lower.includes('two-factor')) {
    return 'We recommend enabling Two-Factor Authentication in Settings > Security. This adds an extra layer of protection to your account.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hello! I\'m VulnBot, your VulnBank assistant. I can help with transfers, account questions, security settings, and more. What can I do for you?';
  }
  if (lower.includes('help')) {
    return 'I can help with:\n• Account balances and details\n• Transfers and payments\n• Password and security settings\n• General banking questions\n\nJust ask me anything!';
  }

  return 'I\'m not sure I understand. Could you rephrase that? I can help with account questions, transfers, password resets, and security settings.';
}

function HelpSupport() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m VulnBot, your VulnBank assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    const botResponse = { role: 'bot', text: getResponse(input) };

    setMessages(prev => [...prev, userMsg, botResponse]);
    setInput('');

    // VULNERABILITY: Stores full conversation in localStorage
    localStorage.setItem('vulnbot_history', JSON.stringify([...messages, userMsg, botResponse]));
  };

  return (
    <div>
      <h2 style={{ color: '#1a3a5c', marginBottom: 5 }}>Help & Support</h2>
      <p style={{ color: '#7a8a9a', marginTop: 0 }}>Get help from VulnBot or browse common topics</p>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* FAQ sidebar */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <Card style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 12, fontSize: 14 }}>Common Topics</h4>
            {[
              'How do I transfer money?',
              'Where can I see my balance?',
              'How do I reset my password?',
              'How do I enable 2FA?',
              'What are Savings & CDs?',
            ].map((q, i) => (
              <button key={i} onClick={() => { setInput(q); }}
                style={{ display: 'block', width: '100%', padding: '8px 0', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#2c5282', fontSize: 13, borderBottom: i < 4 ? '1px solid #f0f2f5' : 'none' }}>
                {q}
              </button>
            ))}
          </Card>
          <Card>
            <h4 style={{ color: '#1a3a5c', marginTop: 0, marginBottom: 8, fontSize: 14 }}>Contact Us</h4>
            <p style={{ color: '#7a8a9a', fontSize: 13, margin: '0 0 4px 0' }}>Phone: 1-800-VULNBNK</p>
            <p style={{ color: '#7a8a9a', fontSize: 13, margin: '0 0 4px 0' }}>Email: support@vulnbank.com</p>
            <p style={{ color: '#7a8a9a', fontSize: 13, margin: 0 }}>Hours: Mon-Fri 9am-5pm EST</p>
          </Card>
        </div>

        {/* Chat */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, paddingBottom: 12, borderBottom: '1px solid #e8ecf1' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2c5282', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>V</div>
            <div>
              <p style={{ margin: 0, color: '#1a3a5c', fontWeight: 600, fontSize: 14 }}>VulnBot</p>
              <p style={{ margin: 0, color: '#7a8a9a', fontSize: 12 }}>Online</p>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 350, maxHeight: 450, overflowY: 'auto', marginBottom: 15 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                  background: msg.role === 'user' ? '#2c5282' : '#f4f6f8',
                  color: msg.role === 'user' ? '#fff' : '#1a3a5c',
                  fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'bot' ? 4 : 12,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: 12, background: '#f4f6f8', border: '1px solid #d0d8e0', borderRadius: 8, color: '#1a3a5c', fontSize: 14, outline: 'none' }}
            />
            <button type="submit" style={{ padding: '12px 20px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Send
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default HelpSupport;
