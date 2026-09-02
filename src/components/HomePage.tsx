import React from 'react';
import type { KingdomSummary, Player, ViewMode } from '../types/stats';
import {
  Swords,
  Crown,
  Shield,
  BarChart2,
  Table,
  Flame,
  Award,
  ChevronRight,
  Crosshair,
  Sparkles,
  Users
} from 'lucide-react';

interface HomePageProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  onNavigate: (view: ViewMode) => void;
  onOpenPlayer: (name: string) => void;
  onOpenKingdom: (server: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  kingdoms,
  players,
  onNavigate,
  onOpenPlayer,
  onOpenKingdom
}) => {
  // Top 5 Attackers
  const topAttackers = [...players].sort((a, b) => b.total_pow - a.total_pow).slice(0, 5);
  // Top 5 Guards
  const topGuards = [...players].sort((a, b) => b.dgp - a.dgp).slice(0, 5);
  // Top 5 Lethal Hit Rate
  const topLethal = [...players].sort((a, b) => b.lethal - a.lethal).slice(0, 5);
  // Top 5 Archer Specialists
  const topArchers = [...players].sort((a, b) => b.archer_pow - a.archer_pow).slice(0, 5);

  const redSkillsMap: Record<string, { redSkills: number; customBuff?: number }> = {
    'K54': { redSkills: 3 },
    'K197': { redSkills: 5 },
    'K116': { redSkills: 4 },
    'K60': { redSkills: 1 },
    'K176': { redSkills: 1 },
    'K91': { redSkills: 3 },
    'K170': { redSkills: 1, customBuff: 0.03 },
    'K138': { redSkills: 1 },
    'K88': { redSkills: 1 },
    'K48': { redSkills: 4 }
  };

  const getRedBonus = (skills: number, customBuff?: number) => {
    if (customBuff !== undefined) return customBuff;
    if (skills <= 0) return 0.0;
    return 0.04 + (skills - 1) * 0.01;
  };

  const rankedKingdoms = [...kingdoms].sort((a, b) => {
    const cfgA = redSkillsMap[a.server] || { redSkills: 0 };
    const cfgB = redSkillsMap[b.server] || { redSkills: 0 };
    const wocA = players.find((p) => p.server === a.server && p.is_woc_leader)?.dgp || 0;
    const wocB = players.find((p) => p.server === b.server && p.is_woc_leader)?.dgp || 0;
    const finalA = (a.avg_total + (wocA * 0.85)) * (1 + getRedBonus(cfgA.redSkills, cfgA.customBuff));
    const finalB = (b.avg_total + (wocB * 0.85)) * (1 + getRedBonus(cfgB.redSkills, cfgB.customBuff));
    return finalB - finalA;
  });

  const totalPlayers = players.length;
  const totalKingdoms = kingdoms.length;
  const sPlusPlusCount = players.filter((p) => p.total_pow_tier === 'S++').length;
  const sPlusCount = players.filter((p) => p.total_pow_tier === 'S+').length;

  // Global Stat Calculations
  const highestPowerPlayer = topAttackers[0];
  const highestGuardPlayer = topGuards[0];
  const highestLethalPlayer = topLethal[0];

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '40px' }} className="animate-fade-in">
      {/* 1. Hero Spotlight & Strategic Quick-Actions */}
      <div
        className="cyber-panel"
        style={{
          padding: '28px 24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          background: 'linear-gradient(135deg, rgba(20, 29, 53, 0.9) 0%, rgba(10, 15, 28, 0.98) 100%)',
          boxShadow: '0 20px 50px -15px rgba(0,0,0,0.85), 0 0 35px rgba(99, 102, 241, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #818cf8', color: '#c7d2fe' }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Strategic Analytics
              </span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                ● {totalKingdoms} Kingdoms Loaded ({totalPlayers} Players)
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: '8px',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              Kingdom Analytics & Command Center
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Comprehensive performance intelligence across all active kingdoms. Monitor Attack, HP, Defense, Damage multipliers, and Fortress WOC Guard scaling.
            </p>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('compare')}
              className="btn-toggle active"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Swords size={16} /> Compare Players
            </button>
            <button
              onClick={() => onNavigate('kingdoms')}
              className="btn-toggle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#fff'
              }}
            >
              <Crown size={16} /> Kingdom Cards
            </button>
            <button
              onClick={() => onNavigate('table')}
              className="btn-toggle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#fff'
              }}
            >
              <Table size={16} /> Player Table
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Highlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '10px', color: '#818cf8' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Tracked</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
                {totalPlayers} Players
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '10px', color: '#f87171' }}>
              <Flame size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Apex S++ Tier</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ef4444', fontFamily: 'Space Grotesk, sans-serif' }}>
                {sPlusPlusCount} Champions
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '10px', color: '#fbbf24' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Elite S+ Tier</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Space Grotesk, sans-serif' }}>
                {sPlusCount} Players
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '10px', color: '#34d399' }}>
              <Crown size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>#1 Kingdom</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', fontFamily: 'Space Grotesk, sans-serif' }}>
                {rankedKingdoms[0]?.server || 'K54'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hall of Fame / MVP Feature Spotlight Cards */}
      <div style={{ marginBottom: '28px' }}>
        <div className="section-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#fbbf24" /> Hall of Fame // Individual Standouts
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
            Click any standout to view full profile
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* MVP 1: Highest Total Attack Power */}
          {highestPowerPlayer && (
            <div
              className="cyber-panel"
              onClick={() => onOpenPlayer(highestPowerPlayer.name)}
              style={{
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(239, 68, 68, 0.08) 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  👑 Highest Total Attack Power
                </span>
                <span className="badge">{highestPowerPlayer.server}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {highestPowerPlayer.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Attack Power:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f87171', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {highestPowerPlayer.total_pow.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* MVP 2: Strongest WOC Fortress Guard */}
          {highestGuardPlayer && (
            <div
              className="cyber-panel"
              onClick={() => onOpenPlayer(highestGuardPlayer.name)}
              style={{
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(16, 185, 129, 0.08) 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  🛡️ Strongest WOC Guard
                </span>
                <span className="badge">{highestGuardPlayer.server}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {highestGuardPlayer.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fortress Guard Pool:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34d399', fontFamily: 'Space Grotesk, sans-serif' }}>
                  +{highestGuardPlayer.dgp.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* MVP 3: Highest Lethal Hit Rate */}
          {highestLethalPlayer && (
            <div
              className="cyber-panel"
              onClick={() => onOpenPlayer(highestLethalPlayer.name)}
              style={{
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(236, 72, 153, 0.08) 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#ec4899';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.4)' }}>
                  🎯 Highest Lethal Hit Rate
                </span>
                <span className="badge">{highestLethalPlayer.server}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {highestLethalPlayer.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lethal Hit Chance:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f472b6', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {highestLethalPlayer.lethal}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Top Standings Split: Apex Attackers, Fortress Guards, Archer & Cav Specialists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Apex Attackers */}
        <div className="cyber-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f43f5e" /> Top Attack Power Leaders
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('table')}>
              View All ➔
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topAttackers.map((p, idx) => (
              <div
                key={p.name}
                onClick={() => onOpenPlayer(p.name)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#64748b',
                      width: '20px'
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.server}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#a5b4fc', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {p.total_pow.toLocaleString()}
                  </div>
                  <span className="tier-pill" style={{ background: p.total_pow_color, fontSize: '0.62rem' }}>
                    Tier {p.total_pow_tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fortress Guards */}
        <div className="cyber-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#10b981" /> Top Fortress Guards (WOC)
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Pure Defense</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topGuards.map((p, idx) => (
              <div
                key={p.name}
                onClick={() => onOpenPlayer(p.name)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.18)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#64748b',
                      width: '20px'
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {p.name} {p.is_woc_leader && <span style={{ fontSize: '0.7rem' }}>🛡️</span>}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.server}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', fontFamily: 'Space Grotesk, sans-serif' }}>
                    +{p.dgp.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Guard Pwr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Archer Specialists */}
        <div className="cyber-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crosshair size={18} color="#06b6d4" /> Top Archer Specialists
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 600 }}>Archer Atk Pwr</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topArchers.map((p, idx) => (
              <div
                key={p.name}
                onClick={() => onOpenPlayer(p.name)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.18)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#64748b',
                      width: '20px'
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.server}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {p.archer_pow.toLocaleString()}
                  </div>
                  <span className="tier-pill" style={{ background: p.archer_pow_color, fontSize: '0.62rem' }}>
                    Tier {p.archer_pow_tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Kingdom Power Rankings Snapshot */}
      <div className="cyber-panel" style={{ padding: '22px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={20} color="#f59e0b" /> Overall Kingdom Power Ranking
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Avg Total Attack Power + Top WOC Guard) × Red Skill Scaling
            </span>
          </div>

          <button
            onClick={() => onNavigate('kingdoms')}
            className="btn-toggle active"
            style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem' }}
          >
            All Kingdom Cards ➔
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {rankedKingdoms.map((kd, rankIdx) => {
            const cfg = redSkillsMap[kd.server] || { redSkills: 0 };
            const wocLeader = players.find((p) => p.server === kd.server && p.is_woc_leader);
            const guardPwr = wocLeader ? wocLeader.dgp : 0;
            const redBonus = getRedBonus(cfg.redSkills, cfg.customBuff);
            const finalKdPwr = Math.round((kd.avg_total + (guardPwr * 0.85)) * (1 + redBonus));

            return (
              <div
                key={kd.server}
                onClick={() => onOpenKingdom(kd.server)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#818cf8';
                  e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#818cf8', fontFamily: 'Space Grotesk, sans-serif' }}>
                      #{rankIdx + 1}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {kd.server}
                    </span>
                    {cfg.redSkills > 0 && (
                      <span style={{ fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                        🦁 {cfg.redSkills} Red
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {kd.count} Active Players
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {finalKdPwr.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                    Drilldown <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Direct Navigation Portals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div
          className="cyber-panel"
          onClick={() => onNavigate('graphs')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(6, 182, 212, 0.35)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#06b6d4';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <BarChart2 size={22} color="#06b6d4" />
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>KD Benchmarks & Charts</h4>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.45 }}>
            Interactive stacked tier distributions and average strength comparative graphs across all kingdoms.
          </p>
        </div>

        <div
          className="cyber-panel"
          onClick={() => onNavigate('compare')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(236, 72, 153, 0.35)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ec4899';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Swords size={22} color="#ec4899" />
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Multi-Player Comparison</h4>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.45 }}>
            5-axis normalized Radar polygon, Head-to-Head bar charts, and 👑 highlighted 35+ stat matrix.
          </p>
        </div>

        <div
          className="cyber-panel"
          onClick={() => onNavigate('table')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(139, 92, 246, 0.35)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Table size={22} color="#8b5cf6" />
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Master Player Database</h4>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.45 }}>
            Sortable 35+ column table with instantaneous player search, server filters, and profile modals.
          </p>
        </div>
      </div>
    </div>
  );
};
