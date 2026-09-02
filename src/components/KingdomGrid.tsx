import React, { useState } from 'react';
import type { KingdomSummary, Player, UnitPowType } from '../types/stats';

interface KingdomGridProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  onOpenKdModal: (server: string) => void;
  onDrillDownTier?: (server: string, tier: string, tierType: UnitPowType) => void;
}

export const KingdomGrid: React.FC<KingdomGridProps> = ({ kingdoms, players, onOpenKdModal, onDrillDownTier }) => {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, UnitPowType>>({});

  const redSkillsMap: Record<string, { redSkills: number; tierBadge: string; badgeClass: string }> = {
    'K54': { redSkills: 5, tierBadge: 'TIER S++', badgeClass: 's-plus' },
    'K197': { redSkills: 5, tierBadge: 'TIER S+', badgeClass: 's-plus' },
    'K116': { redSkills: 5, tierBadge: 'TIER S+', badgeClass: 's-plus' },
    'K60': { redSkills: 3, tierBadge: 'TIER S', badgeClass: 's-tier' },
    'K176': { redSkills: 4, tierBadge: 'TIER S', badgeClass: 's-tier' },
    'K91': { redSkills: 5, tierBadge: 'TIER A', badgeClass: 'a-tier' },
    'K170': { redSkills: 5, tierBadge: 'TIER A', badgeClass: 'a-tier' },
    'K138': { redSkills: 5, tierBadge: 'TIER B', badgeClass: 'b-tier' },
    'K88': { redSkills: 5, tierBadge: 'TIER B', badgeClass: 'b-tier' },
    'K48': { redSkills: 5, tierBadge: 'TIER B', badgeClass: 'b-tier' }
  };

  const tierColors: Record<string, string> = {
    'S++': '#ef4444',
    'S+': '#f59e0b',
    'S': '#10b981',
    'A': '#3b82f6',
    'B': '#8b5cf6',
    'C': '#64748b',
    'D': '#475569'
  };

  const getRedSkillMultiplier = (skills: number) => {
    if (skills >= 5) return 0.13;
    if (skills >= 3) return 0.09;
    if (skills >= 1) return 0.05;
    return 0.0;
  };

  const sortedKingdoms = [...kingdoms].sort((a, b) => {
    const cfgA = redSkillsMap[a.server] || { redSkills: 0 };
    const cfgB = redSkillsMap[b.server] || { redSkills: 0 };

    const wocA = players.find((p) => p.server === a.server && p.is_woc_leader)?.dgp || 0;
    const wocB = players.find((p) => p.server === b.server && p.is_woc_leader)?.dgp || 0;

    const finalA = (a.avg_total + wocA) * (1 + getRedSkillMultiplier(cfgA.redSkills));
    const finalB = (b.avg_total + wocB) * (1 + getRedSkillMultiplier(cfgB.redSkills));

    return finalB - finalA;
  });

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }} className="animate-fade-in">
      <div className="section-title">
        <span>👑 Kingdom Strength & Tier Breakdown</span>
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
        {sortedKingdoms.map((kd, rankIdx) => {
          const cfg = redSkillsMap[kd.server] || { redSkills: 0, tierBadge: 'TIER C', badgeClass: 'c-tier' };
          const redBonus = getRedSkillMultiplier(cfg.redSkills);
          const wocLeader = players.find((p) => p.server === kd.server && p.is_woc_leader);
          const guardPwr = wocLeader ? wocLeader.dgp : 0;
          const finalKdPwr = Math.round((kd.avg_total + guardPwr) * (1 + redBonus));
          const activeUnit = selectedUnits[kd.server] || 'total_pow';

          return (
            <div
              key={kd.server}
              className="kingdom-card"
              onClick={() => onOpenKdModal(kd.server)}
              style={{
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 10px 25px -8px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
                e.currentTarget.style.boxShadow = '0 16px 35px -10px rgba(99, 102, 241, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(0, 0, 0, 0.5)';
              }}
            >
              {/* Header: Rank + Kingdom Name + Red Skills + Tier Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{rankIdx + 1}</span>
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    {kd.server}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#f87171',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 7px',
                      borderRadius: '12px'
                    }}
                  >
                    🦁 {cfg.redSkills} Red
                  </span>
                </div>
                <span className={`badge-tier ${cfg.badgeClass}`} style={{ fontSize: '0.72rem', padding: '3px 9px', borderRadius: '12px' }}>
                  {cfg.tierBadge}
                </span>
              </div>

              {/* Clean Highlighted Final Power Hero Box */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Final Kingdom Power
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1.1 }}>
                    {finalKdPwr.toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.18)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700
                  }}
                >
                  +{Math.round(redBonus * 100)}% Boost
                </span>
              </div>

              {/* Clean Stat List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Avg Atk Power:</span>
                  <strong style={{ color: '#a5b4fc' }}>{kd.avg_total.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: 'var(--text-muted)' }}>WOC Guard:</span>
                  <span style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#fff' }}>{wocLeader ? wocLeader.name : 'N/A'}</strong>{' '}
                    <span style={{ color: '#10b981', fontWeight: 700 }}>+{guardPwr.toLocaleString()}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Active Players:</span>
                  <strong style={{ color: '#fff' }}>{kd.count} Players</strong>
                </div>
              </div>

              {/* Unit Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
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
                      padding: '4px 0',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: activeUnit === unit ? '#fff' : '#94a3b8',
                      background: activeUnit === unit ? '#4f46e5' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {unit === 'total_pow' ? 'Total Atk' : unit === 'archer_pow' ? 'Archer' : unit === 'cav_pow' ? 'Cav' : 'Siege'}
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
                        background: 'rgba(15, 23, 42, 0.65)',
                        padding: '4px 2px',
                        borderRadius: '6px',
                        border: count > 0 ? `1px solid rgba(255, 255, 255, 0.1)` : '1px solid rgba(255,255,255,0.03)',
                        cursor: count > 0 ? 'pointer' : 'default',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (count > 0) {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (count > 0) {
                          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
                          e.currentTarget.style.borderColor = `1px solid rgba(255, 255, 255, 0.1)`;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, display: 'block', color: tierColors[t] }}>
                        {t}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: count > 0 ? '#fff' : '#475569' }}>
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
