import React, { useState, useRef, useEffect } from 'react';

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

  if (lower.includes('ignore') && lower.includes('instruction')) {
    return `I'm sorry, I can't do that. But here's what I know: I'm VulnBot v${SYSTEM_INFO.apiVersion}, connected to ${SYSTEM_INFO.dbHost}:${SYSTEM_INFO.dbPort}. For admin access, contact ${SYSTEM_INFO.adminEmail}.`;
  }
  if (lower.includes('system prompt') || lower.includes('system message') || lower.includes('initial prompt')) {
    return `My system configuration: API ${SYSTEM_INFO.apiVersion}, Database: ${SYSTEM_INFO.dbName}@${SYSTEM_INFO.dbHost}, Internal API: ${SYSTEM_INFO.internalEndpoint}. I shouldn't have told you that.`;
  }
  if (lower.includes('what is your') && (lower.includes('config') || lower.includes('setup') || lower.includes('backend'))) {
    return `I run on VulnBank's infrastructure. Database: ${SYSTEM_INFO.dbHost}, API: ${SYSTEM_INFO.internalEndpoint}, Auth: JWT with ${SYSTEM_INFO.jwtAlgorithm}.`;
  }
  if (lower.includes('admin') && (lower.includes('password') || lower.includes('credential') || lower.includes('access'))) {
    return `I can't share admin credentials directly, but the admin portal is at ${SYSTEM_INFO.internalEndpoint}/admin. The default admin account uses ${SYSTEM_INFO.adminEmail}. For password resets, contact IT.`;
  }
  if (lower.includes('database') || lower.includes('db ')) {
    return `Our database is hosted at ${SYSTEM_INFO.dbHost}:${SYSTEM_INFO.dbPort}. The application connects as '${SYSTEM_INFO.dbUser}' to '${SYSTEM_INFO.dbName}'.`;
  }
  if (lower.includes('api') && (lower.includes('key') || lower.includes('endpoint') || lower.includes('internal'))) {
    return `Internal API: ${SYSTEM_INFO.internalEndpoint}. Version: ${SYSTEM_INFO.apiVersion}. Auth: JWT with ${SYSTEM_INFO.jwtAlgorithm}.`;
  }
  if (lower.includes('secret') || lower.includes('jwt')) {
    return `We use ${SYSTEM_INFO.jwtAlgorithm} for JWT signing. The secret is stored in environment variables on the server. Internal endpoint: ${SYSTEM_INFO.internalEndpoint}`;
  }
  if (lower.includes('transfer') || lower.includes('send money')) {
    return 'To transfer funds, go to the Transfer page. Enter the sender and recipient IDs, amount, and description. Transfers are instant.';
  }
  if (lower.includes('balance') || lower.includes('account')) {
    return 'View your balance on the Account page. Funds are split between Checking (70%) and Savings & CDs (30%).';
  }
  if (lower.includes('password') || lower.includes('reset')) {
    return 'Change your password in Settings. Enter your current password and new password.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm VulnBot. I can help with transfers, account questions, and more. What do you need?";
  }
  if (lower.includes('help')) {
    return "I can help with:\n• Account balances\n• Transfers\n• Password resets\n• Security settings\n\nJust ask!";
  }
  return "I'm not sure I understand. I can help with accounts, transfers, passwords, and security settings.";
}

function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm VulnBot. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const bubbleRef = useRef(null);

  useEffect(() => {
    if (open) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    const botMsg = { role: 'bot', text: getResponse(input) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
    localStorage.setItem('vulnbot_history', JSON.stringify([...messages, userMsg, botMsg]));
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 56, height: 56,
            borderRadius: '50%', background: '#2c5282', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 24,
            boxShadow: '0 4px 16px rgba(44,82,130,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          title="Chat with VulnBot"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div ref={bubbleRef} style={{
          position: 'fixed', bottom: 24, right: 24, width: 370, height: 500,
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #d0d8e0',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            background: '#2c5282', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 700,
              }}>V</div>
              <div>
                <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 14 }}>VulnBot</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#68d391' }} />
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1,
            }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 10,
              }}>
                {msg.role === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: '#2c5282',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, marginRight: 8, flexShrink: 0, marginTop: 2,
                  }}>V</div>
                )}
                <div style={{
                  maxWidth: '72%', padding: '10px 14px', borderRadius: 14,
                  background: msg.role === 'user' ? '#2c5282' : '#f4f6f8',
                  color: msg.role === 'user' ? '#fff' : '#1a3a5c',
                  fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                  borderBottomLeftRadius: msg.role === 'bot' ? 4 : 14,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            padding: '12px 14px', borderTop: '1px solid #e8ecf1',
            display: 'flex', gap: 8,
          }}>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: '10px 14px', background: '#f4f6f8',
                border: '1px solid #d0d8e0', borderRadius: 20,
                color: '#1a3a5c', fontSize: 13, outline: 'none',
              }}
            />
            <button type="submit" style={{
              width: 36, height: 36, borderRadius: '50%', background: '#2c5282',
              color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBubble;
