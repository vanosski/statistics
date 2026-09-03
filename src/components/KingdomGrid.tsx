import React, { useState } from 'react';
import type { KingdomSummary, Player, UnitPowType } from '../types/stats';
import { Crown, Flame, Swords } from 'lucide-react';
import { getRankedKingdoms } from '../utils/kingdomRanking';

interface KingdomGridProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  onOpenKdModal: (server: string) => void;
  onDrillDownTier?: (server: string, tier: string, tierType: UnitPowType) => void;
}

export const KingdomGrid: React.FC<KingdomGridProps> = ({ kingdoms, players, onOpenKdModal, onDrillDownTier }) => {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, UnitPowType>>({});

  const tierColors: Record<string, string> = {
    'S++': '#ef4444',
    'S+': '#f59e0b',
    'S': '#10b981',
    'A': '#3b82f6',
    'B': '#8b5cf6',
    'C': '#64748b',
    'D': '#475569'
  };

  const sortedKingdoms = getRankedKingdoms(kingdoms, players);

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }} className="animate-fade-in">
      <div className="section-title">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crown size={22} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }} /> Kingdom Strength & Tier Breakdown
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
          ✨ Click any card for comprehensive roster & key leader drilldown
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '18px'
        }}
      >
        {sortedKingdoms.map((kd) => {
          const cfg = kd.config;
          const finalKdPwr = kd.finalKingdomPower;
          const guardPwr = kd.guardPower;
          const wocLeader = kd.wocLeader;
          const activeUnit = selectedUnits[kd.server] || 'total_pow';

          return (
            <div
              key={kd.server}
              className="kingdom-card"
              onClick={() => onOpenKdModal(kd.server)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.8), 0 0 20px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header: Rank + Kingdom Name + Tier Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>#{kd.rank}</span>
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>
                    {kd.server}
                  </span>
                  {cfg.redSkills > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      <Flame size={14} color="#ef4444" style={{ marginRight: '4px', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' }} /> {cfg.redSkills} Red
                    </span>
                  )}
                  {cfg.isCivilWar && (
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      <Swords size={14} color="#ef4444" style={{ marginRight: '4px', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' }} /> Civil War
                    </span>
                  )}
                </div>
                <span className={`badge-tier ${cfg.badgeClass}`} style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '12px' }}>
                  {cfg.tierBadge}
                </span>
              </div>

              {/* Clean Highlighted Final Power Hero Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderLeft: '3px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Final Kingdom Power
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                    {finalKdPwr.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Clean Stat List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Avg Atk Power:</span>
                  <strong style={{ color: '#a5b4fc' }}>{kd.avg_total.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>WOC Guard ({wocLeader ? wocLeader.name : 'N/A'}):</span>
                  <strong style={{ color: '#f8fafc' }}>{guardPwr.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Active Players:</span>
                  <strong style={{ color: '#f8fafc' }}>{kd.count} Players</strong>
                </div>
              </div>

              {/* Unit Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '4px',
                  borderRadius: '10px',
                  marginTop: '4px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {(['total_pow', 'archer_pow', 'cav_pow', 'siege_pow'] as UnitPowType[]).map((unit) => (
                  <div
                    key={unit}
                    onClick={() => setSelectedUnits({ ...selectedUnits, [kd.server]: unit })}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '6px 0',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: activeUnit === unit ? '#fff' : '#64748b',
                      background: activeUnit === unit ? '#4f46e5' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {unit === 'total_pow' ? 'Total' : unit === 'archer_pow' ? 'Archer' : unit === 'cav_pow' ? 'Cav' : 'Siege'}
                  </div>
                ))}
              </div>

              {/* Tier Distribution Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {(['S++', 'S+', 'S', 'A', 'B', 'C', 'D'] as const).map((t) => {
                  const count = kd.tiers[activeUnit]?.[t] || 0;
                  return (
                    <div
                      key={t}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (count > 0 && onDrillDownTier) {
                          onDrillDownTier(kd.server, t, activeUnit);
                        }
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: count > 0 ? `1px solid ${tierColors[t]}40` : '1px solid transparent',
                        cursor: count > 0 ? 'pointer' : 'default',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (count > 0) {
                          e.currentTarget.style.background = `${tierColors[t]}20`;
                          e.currentTarget.style.borderColor = tierColors[t];
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (count > 0) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = `${tierColors[t]}40`;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, display: 'block', color: count > 0 ? tierColors[t] : '#475569' }}>
                        {t}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: count > 0 ? '#f1f5f9' : '#334155' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '3px' }}>
                Details & Full Roster ➔
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
