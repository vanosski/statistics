import React from 'react';
import { Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        width: '100%',
        maxWidth: '1400px',
        marginTop: '20px',
        marginBottom: '24px',
        padding: '0 10px'
      }}
    >
      <div
        className="cyber-panel"
        style={{
          padding: '16px 20px',
          background: 'rgba(10, 15, 28, 0.8)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '14px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ color: '#818cf8', marginTop: '2px', flexShrink: 0 }}>
          <Info size={18} />
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.55 }}>
          <strong style={{ color: '#c7d2fe', display: 'block', marginBottom: '3px' }}>
            Methodology & Calculation Disclaimer:
          </strong>
          Total Attack Power is calculated as a composite sum of base Archer, Cavalry, and Siege power. This serves as a standardized baseline statistic and may not directly translate to actual battle or rally performance. True rally combat power depends heavily on defender/attacker formations, troop unit breakup, and stat diminishing returns.
        </div>
      </div>
      
      {/* Made by Arya and Crozy Credits & Last Updated */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          fontSize: '0.82rem',
          color: '#94a3b8',
          flexWrap: 'wrap'
        }}
      >
        <span>Last Land Statistics Tracker</span>
        <span>•</span>
        <span>Last Updated: September 1, 2026</span>
        <span>•</span>
        <span>
          Made by <strong style={{ color: '#a5b4fc' }}>Arya</strong> and{' '}
          <strong style={{ color: '#ec4899' }}>Crozy</strong>
        </span>
      </div>
    </footer>
  );
};
