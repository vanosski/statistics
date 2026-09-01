import React from 'react';
import type { ViewMode } from '../types/stats';
import { BarChart2, Crown, Swords, Table } from 'lucide-react';

interface TopNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentView, onSelectView }) => {
  const tabs: { id: ViewMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'graphs', label: 'KD Benchmarks', shortLabel: 'Benchmarks', icon: <BarChart2 size={16} /> },
    { id: 'kingdoms', label: 'Kingdom Cards', shortLabel: 'Kingdoms', icon: <Crown size={16} /> },
    { id: 'compare', label: 'Player Compare', shortLabel: 'Compare', icon: <Swords size={16} /> },
    { id: 'table', label: 'Player Table', shortLabel: 'Table', icon: <Table size={16} /> }
  ];

  return (
    <div
      style={{
        position: 'sticky',
        top: '8px',
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}
    >
      <nav
        className="nav-tabs-container"
        style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          padding: '4px 6px',
          borderRadius: '30px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99, 102, 241, 0.2)',
          overflowX: 'auto',
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              className="nav-tab-btn"
              onClick={() => onSelectView(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                flexShrink: 0
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
