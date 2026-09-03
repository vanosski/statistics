import React, { useRef, useEffect } from 'react';
import type { ViewMode } from '../types/stats';
import { LayoutDashboard, BarChart2, Crown, Swords, Table, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentView, onSelectView }) => {
  const { isApproved } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  const tabs: { id: ViewMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Overview', shortLabel: 'Home', icon: <LayoutDashboard size={15} /> },
    { id: 'graphs', label: 'KD Benchmarks', shortLabel: 'Benchmarks', icon: <BarChart2 size={15} /> },
    { id: 'kingdoms', label: 'Kingdom Cards', shortLabel: 'Kingdoms', icon: <Crown size={15} /> },
    { id: 'compare', label: 'Player Compare', shortLabel: 'Compare', icon: <Swords size={15} /> },
    { id: 'table', label: 'Player Table', shortLabel: 'Table', icon: <Table size={15} /> }
  ];

  // Auto-scroll the active tab into the center of view on mobile
  useEffect(() => {
    if (activeBtnRef.current && navRef.current) {
      const nav = navRef.current;
      const btn = activeBtnRef.current;
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      
      const scrollLeft = btn.offsetLeft - (navRect.width / 2) + (btnRect.width / 2);
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentView]);

  return (
    <div
      style={{
        position: 'sticky',
        top: '6px',
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}
    >
      <div style={{ position: 'relative', maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <nav
          ref={navRef}
          className="nav-tabs-container"
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(10, 15, 28, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '4px',
            borderRadius: '30px',
            boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.25)',
            overflowX: 'auto',
            maxWidth: '100vw',
            justifyContent: 'flex-start',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          {tabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeBtnRef : null}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectView(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Space Grotesk, sans-serif',
                  boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.5)' : 'none',
                  flexShrink: 0
                }}
              >
                <span style={{ color: isActive ? '#fff' : '#818cf8', display: 'flex', alignItems: 'center' }}>
                  {tab.icon}
                </span>
                <span className="nav-tab-label-full">{tab.label}</span>
                <span className="nav-tab-label-short">{tab.shortLabel}</span>
                {!isApproved && (tab.id === 'compare' || tab.id === 'table') && (
                  <Lock size={11} style={{ color: '#fbbf24', marginLeft: '3px', opacity: 0.85 }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
