import React from 'react';
import { Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        textAlign: 'center',
        marginBottom: '14px',
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px'
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
        👑 Last Land Statistics Tracker
      </h1>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          color: '#c7d2fe',
          fontWeight: 600
        }}
      >
        <Calendar size={12} color="#818cf8" />
        <span>Last Updated: September 1, 2026</span>
      </div>
    </header>
  );
};
