import React from 'react';
import type { ViewMode } from '../types/stats';
import { Sparkles, BarChart2, Crown, Swords, Table } from 'lucide-react';

interface TopNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentView, onSelectView }) => {
  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Views', icon: <Sparkles size={16} /> },
    { id: 'graphs', label: 'KD Benchmarks', icon: <BarChart2 size={16} /> },
    { id: 'kingdoms', label: 'Kingdom Cards', icon: <Crown size={16} /> },
    { id: 'compare', label: 'Player Compare', icon: <Swords size={16} /> },
    { id: 'table', label: 'Player Table', icon: <Table size={16} /> }
  ];

  return (
    <div
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '26px'
      }}
    >
      <nav
        style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          padding: '6px 8px',
          borderRadius: '30px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99, 102, 241, 0.2)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
