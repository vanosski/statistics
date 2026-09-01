import React from 'react';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        textAlign: 'center',
        marginBottom: '16px',
        padding: '0 10px'
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 45%, #ec4899 80%, #06b6d4 100%)',
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
