import React from 'react';
import type { KingdomSummary, Player, ViewMode } from '../types/stats';
import { Swords, Crown, ShieldAlert, BarChart2, Table, Flame, Award, ChevronRight } from 'lucide-react';

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

  const redSkillsMap: Record<string, number> = {
    'K54': 5, 'K197': 5, 'K116': 5, 'K91': 3, 'K60': 1, 'K176': 1, 'K170': 1, 'K138': 1
  };

  const getRedBonus = (skills: number) => {
    if (skills >= 5) return 0.13;
    if (skills >= 3) return 0.09;
    if (skills >= 1) return 0.05;
    return 0.0;
  };

  const rankedKingdoms = [...kingdoms].sort((a, b) => {
    const wocA = players.find((p) => p.server === a.server && p.is_woc_leader)?.dgp || 0;
    const wocB = players.find((p) => p.server === b.server && p.is_woc_leader)?.dgp || 0;
    const finalA = (a.avg_total + wocA) * (1 + getRedBonus(redSkillsMap[a.server] || 0));
    const finalB = (b.avg_total + wocB) * (1 + getRedBonus(redSkillsMap[b.server] || 0));
    return finalB - finalA;
  });

  const totalPlayers = players.length;
  const totalKingdoms = kingdoms.length;
  const sPlusPlusCount = players.filter((p) => p.total_pow_tier === 'S++').length;
  const sPlusCount = players.filter((p) => p.total_pow_tier === 'S+').length;

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '40px' }} className="animate-fade-in">
      {/* 1. Cyber Brutalism Hero Terminal Banner */}
      <div
        className="cyber-panel"
        style={{
          padding: '28px 24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid rgba(99, 102, 241, 0.45)',
          boxShadow: '0 20px 50px -15px rgba(0,0,0,0.85), 0 0 30px rgba(99, 102, 241, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #ec4899', color: '#f472b6' }}>
                WAR PROTOCOL READY
              </span>
              <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em' }}>
                SYS_VERSION // 2.4.0
              </span>
            </div>
            <h2
              className="cyber-title"
              style={{
                fontSize: 'clamp(1.4rem, 3.5vw, 2.1rem)',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: '8px'
              }}
            >
              KINGDOM WAR TELEMETRY HUB
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Aggregated combat intelligence across {totalKingdoms} warring kingdoms. Pure telemetry of General Troop & Unit Specific Attack, HP, Defense, Damage, and WOC Guard scaling.
            </p>
          </div>

          {/* Quick Action Buttons */}
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
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)'
              }}
            >
              <Swords size={16} /> Open Player Comparison
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
              <Crown size={16} /> View Kingdom Ranks
            </button>
          </div>
        </div>

        {/* Live System Metric Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracked Players</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a5b4fc', fontFamily: 'Orbitron, sans-serif' }}>{totalPlayers}</div>
          </div>

          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apex S++ Tier</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', fontFamily: 'Orbitron, sans-serif' }}>{sPlusPlusCount}</div>
          </div>

          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Elite S+ Tier</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'Orbitron, sans-serif' }}>{sPlusCount}</div>
          </div>

          <div
            style={{
              background: 'rgba(10, 15, 28, 0.75)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Apex KD</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', fontFamily: 'Orbitron, sans-serif' }}>{rankedKingdoms[0]?.server || 'K54'}</div>
          </div>
        </div>
      </div>

      {/* 2. Top Standings Split: Apex Attackers & Apex WOC Guards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Apex Attackers */}
        <div className="cyber-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f43f5e" /> Apex Attack Power Leaders
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#a5b4fc', cursor: 'pointer' }} onClick={() => onNavigate('table')}>
              View Full Table ➔
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
                  padding: '10px 12px',
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
                      fontFamily: 'Orbitron, sans-serif',
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
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#a5b4fc', fontFamily: 'Orbitron, sans-serif' }}>
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

        {/* Apex Guards */}
        <div className="cyber-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#10b981" /> Fortress WOC Guard Leaders
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Pure Defense Pool</span>
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
                  padding: '10px 12px',
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
                      fontFamily: 'Orbitron, sans-serif',
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
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', fontFamily: 'Orbitron, sans-serif' }}>
                    +{p.dgp.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Guard Pwr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Kingdom Power Rankings Snapshot */}
      <div className="cyber-panel" style={{ padding: '22px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#f59e0b" /> Kingdom Overall Combat Hierarchy
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
            const skills = redSkillsMap[kd.server] || 0;
            const wocLeader = players.find((p) => p.server === kd.server && p.is_woc_leader);
            const guardPwr = wocLeader ? wocLeader.dgp : 0;
            const finalKdPwr = Math.round((kd.avg_total + guardPwr) * (1 + getRedBonus(skills)));

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
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#818cf8', fontFamily: 'Orbitron, sans-serif' }}>
                      #{rankIdx + 1}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {kd.server}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                      🦁 {skills}R
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {kd.count} Players | +{Math.round(getRedBonus(skills) * 100)}% Boost
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'Orbitron, sans-serif' }}>
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

      {/* 4. Quick Navigation Modules */}
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
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#06b6d4')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <BarChart2 size={22} color="#06b6d4" />
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>KD Benchmarks & Charts</h4>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.45 }}>
            Interactive stacked tier distributions and average strength comparative graphs across all 8 kingdoms.
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
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ec4899')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.35)')}
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
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)')}
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
