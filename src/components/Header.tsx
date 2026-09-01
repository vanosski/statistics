import React from 'react';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        textAlign: 'center',
        marginBottom: '18px',
        padding: '0 10px',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
          padding: '4px 14px',
          borderRadius: '20px',
          marginBottom: '10px'
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Live Intelligence Protocol // Pure Stats
        </span>
      </div>

      <h1
        className="cyber-title"
        style={{
          fontSize: 'clamp(1.6rem, 4.5vw, 2.5rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 40%, #ec4899 75%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.15,
          textShadow: '0 0 35px rgba(99, 102, 241, 0.4)'
        }}
      >
        👑 Kingdom Tracker // Stats Terminal
      </h1>
    </header>
  );
};
