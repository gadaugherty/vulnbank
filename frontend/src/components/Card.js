import React from 'react';

function Card({ children, style, accent }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #d0d8e0',
      overflow: 'hidden',
      ...style,
    }}>
      {accent !== false && (
        <div style={{ height: 4, background: '#2c5282' }} />
      )}
      <div style={{ padding: 22 }}>
        {children}
      </div>
    </div>
  );
}

export default Card;
