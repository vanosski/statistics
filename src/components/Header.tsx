import React from 'react';

export const Header: React.FC = () => {
  return (
    <header style={{ textAlign: 'center', maxWidth: '900px', marginBottom: '24px', padding: '0 10px' }}>
      <h1
        style={{
          fontSize: 'clamp(1.85rem, 5vw, 2.6rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #ef4444 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
          lineHeight: 1.2
        }}
      >
        Kingdom Tracker — Statistics Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.88rem, 3vw, 1.05rem)' }}>
        Pure player & kingdom statistics including General Troop & Unit Specific Attack, HP, Defense, & Damage.
      </p>
    </header>
  );
};
