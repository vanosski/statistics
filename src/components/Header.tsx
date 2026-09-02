import React from 'react';
import { Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { session, isApproved, signOut } = useAuth();

  return (
    <header
      style={{
        textAlign: 'center',
        marginBottom: '14px',
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        position: 'relative'
      }}
    >
      {!isApproved ? (
        <button
          onClick={() => window.location.hash = 'login'}
          style={{
            position: 'absolute',
            top: 0,
            right: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
          }}
        >
          <LogOut size={14} style={{ transform: 'rotate(180deg)' }} />
          Admin Login
        </button>
      ) : session && (
        <button
          onClick={signOut}
          style={{
            position: 'absolute',
            top: 0,
            right: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      )}

      <h1
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 45%, #ec4899 80%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginTop: '20px'
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

