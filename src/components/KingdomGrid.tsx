import React, { useState } from 'react';
import type { KingdomSummary, Player, UnitPowType } from '../types/stats';
import { Crown } from 'lucide-react';

interface KingdomGridProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  onOpenKdModal: (server: string) => void;
  onDrillDownTier?: (server: string, tier: string, tierType: UnitPowType) => void;
}

export const KingdomGrid: React.FC<KingdomGridProps> = ({ kingdoms, players, onOpenKdModal, onDrillDownTier }) => {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, UnitPowType>>({});

  const redSkillsMap: Record<string, { redSkills: number; tierBadge: string; badgeClass: string; customBuff?: number }> = {
    'K54': { redSkills: 3, tierBadge: 'TIER S++', badgeClass: 'bg-crimson' },
    'K197': { redSkills: 5, tierBadge: 'TIER S+', badgeClass: 'bg-gold' },
    'K116': { redSkills: 4, tierBadge: 'TIER S+', badgeClass: 'bg-gold' },
    'K60': { redSkills: 1, tierBadge: 'TIER S', badgeClass: 'bg-emerald' },
    'K176': { redSkills: 1, tierBadge: 'TIER S', badgeClass: 'bg-emerald' },
    'K91': { redSkills: 3, tierBadge: 'TIER A', badgeClass: 'bg-blue' },
    'K170': { redSkills: 1, tierBadge: 'TIER A', badgeClass: 'bg-blue', customBuff: 0.03 },
    'K138': { redSkills: 1, tierBadge: 'TIER B', badgeClass: 'bg-purple' },
    'K88': { redSkills: 1, tierBadge: 'TIER B', badgeClass: 'bg-purple' },
    'K48': { redSkills: 4, tierBadge: 'TIER B', badgeClass: 'bg-purple' }
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

  const getRedSkillMultiplier = (skills: number, customBuff?: number) => {
    if (customBuff !== undefined) return customBuff;
    if (skills <= 0) return 0.0;
    return 0.04 + (skills - 1) * 0.01;
  };

  const sortedKingdoms = [...kingdoms].sort((a, b) => {
    const cfgA = redSkillsMap[a.server] || { redSkills: 0, customBuff: undefined };
    const cfgB = redSkillsMap[b.server] || { redSkills: 0, customBuff: undefined };

    const wocA = players.find((p) => p.server === a.server && p.is_woc_leader)?.dgp || 0;
    const wocB = players.find((p) => p.server === b.server && p.is_woc_leader)?.dgp || 0;

    const finalA = (a.avg_total + (wocA * 0.85)) * (1 + getRedSkillMultiplier(cfgA.redSkills, cfgA.customBuff));
    const finalB = (b.avg_total + (wocB * 0.85)) * (1 + getRedSkillMultiplier(cfgB.redSkills, cfgB.customBuff));

    return finalB - finalA;
  });

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }} className="animate-fade-in">
      <div className="section-title">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crown size={22} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }} />
          Kingdom Strength & Tier Breakdown
        </span>
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
          const cfg = redSkillsMap[kd.server] || { redSkills: 0, tierBadge: 'TIER C', badgeClass: 'c-tier', customBuff: undefined };
          const redBonus = getRedSkillMultiplier(cfg.redSkills, cfg.customBuff);
          const wocLeader = players.find((p) => p.server === kd.server && p.is_woc_leader);
          const guardPwr = wocLeader ? wocLeader.dgp : 0;
          const finalKdPwr = Math.round((kd.avg_total + (guardPwr * 0.85)) * (1 + redBonus));
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>#{rankIdx + 1}</span>
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>
                    {kd.server}
                  </span>
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
