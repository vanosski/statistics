import React from 'react';

export const Header: React.FC = () => {
  return (
    <header style={{ textAlign: 'center', marginBottom: '16px', padding: '0 10px' }}>
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #f43f5e 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2,
          letterSpacing: '-0.02em'
        }}
      >
        👑 Kingdom Tracker — Statistics Dashboard
      </h1>
    </header>
  );
};
