import React, { useState } from 'react';
import type { KingdomSummary, Player, UnitPowType } from '../types/stats';

interface KingdomGridProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  onOpenKdModal: (server: string) => void;
}

export const KingdomGrid: React.FC<KingdomGridProps> = ({ kingdoms, players, onOpenKdModal }) => {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, UnitPowType>>({});

  // Kingdom red skill data & tier ranking badges
  const kdConfig: Record<string, { redSkills: number; tierBadge: string; badgeClass: string }> = {
    K54: { redSkills: 5, tierBadge: 'Tier S++', badgeClass: 'bg-crimson' },
    K197: { redSkills: 5, tierBadge: 'Tier S+', badgeClass: 'bg-gold' },
    K116: { redSkills: 5, tierBadge: 'Tier S+', badgeClass: 'bg-gold' },
    K60: { redSkills: 1, tierBadge: 'Tier S', badgeClass: 'bg-emerald' },
    K176: { redSkills: 1, tierBadge: 'Tier S', badgeClass: 'bg-emerald' },
    K91: { redSkills: 3, tierBadge: 'Tier A', badgeClass: 'bg-blue' },
    K170: { redSkills: 1, tierBadge: 'Tier A', badgeClass: 'bg-blue' },
    K138: { redSkills: 1, tierBadge: 'Tier B', badgeClass: 'bg-purple' }
  };

  // Sort kingdoms by ranking order
  const order = ['K54', 'K197', 'K116', 'K60', 'K176', 'K91', 'K170', 'K138'];
  const sortedKingdoms = [...kingdoms].sort((a, b) => order.indexOf(a.server) - order.indexOf(b.server));

  const tierColors: Record<string, string> = {
    'S++': '#ef4444',
    'S+': '#f59e0b',
    'S': '#10b981',
    'A': '#3b82f6',
    'B': '#8b5cf6',
    'C': '#64748b',
    'D': '#475569'
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }}>
      <div className="section-title">
        <span>👑 Kingdom Strength & Tier Breakdown (Pure Stats)</span>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>✨ Click any card for detailed drilldown</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px'
        }}
      >
        {sortedKingdoms.map((kd) => {
          const cfg = kdConfig[kd.server] || { redSkills: 1, tierBadge: 'Tier A', badgeClass: 'bg-blue' };
          const kdPlayers = players.filter((p) => p.server === kd.server);
          const wocLeader = kdPlayers.find((p) => p.is_woc_leader) || kdPlayers[0];
          const guardPwr = wocLeader ? wocLeader.dgp : 0;
          
          // Pure stats kingdom calculation
          const redBonus = cfg.redSkills === 5 ? 0.13 : cfg.redSkills === 3 ? 0.09 : 0.05;
          const finalKdPwr = Math.round((kd.avg_total + guardPwr) * (1 + redBonus));
          const activeUnit = selectedUnits[kd.server] || 'total_pow';

          return (
            <div
              key={kd.server}
              onClick={() => onOpenKdModal(kd.server)}
              style={{
                background: 'var(--panel-bg)',
                border: '1px solid var(--panel-border)',
                backdropFilter: 'blur(14px)',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
                e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--panel-border)';
                e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(0, 0, 0, 0.4)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                  {kd.server}{' '}
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginLeft: '8px' }}>
                    🦁 {cfg.redSkills} Red Skills
                  </span>
                </div>
                <span className={`badge-tier ${cfg.badgeClass}`}>{cfg.tierBadge}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.45 }}>
                Players: <strong style={{ color: '#fff' }}>{kd.count}</strong> | Avg Atk Pwr:{' '}
                <strong style={{ color: '#a5b4fc' }}>{kd.avg_total.toLocaleString()}</strong>
                <br />
                WOC Guard:{' '}
                <strong style={{ color: '#10b981' }}>
                  {wocLeader ? wocLeader.name : 'N/A'} (+{guardPwr.toLocaleString()})
                </strong>
                <br />
                Final KD Pwr:{' '}
                <strong style={{ color: '#f59e0b', fontSize: '1.05rem' }}>{finalKdPwr.toLocaleString()}</strong>{' '}
                <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                  (+{Math.round(redBonus * 100)}%)
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '3px',
                  borderRadius: '8px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {(['total_pow', 'archer_pow', 'cav_pow', 'siege_pow'] as UnitPowType[]).map((unit) => (
                  <div
                    key={unit}
                    className={`kd-tab ${activeUnit === unit ? 'active' : ''}`}
                    onClick={() => setSelectedUnits({ ...selectedUnits, [kd.server]: unit })}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '5px 0',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '5px',
                      cursor: 'pointer',
                      color: activeUnit === unit ? '#fff' : 'var(--text-muted)',
                      background: activeUnit === unit ? 'var(--accent-primary)' : 'transparent'
                    }}
                  >
                    {unit === 'total_pow' ? 'Total Atk' : unit === 'archer_pow' ? 'Archer' : unit === 'cav_pow' ? 'Cav' : 'Siege'}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {(['S++', 'S+', 'S', 'A', 'B', 'C', 'D'] as const).map((t) => {
                  const count = kd.tiers[activeUnit]?.[t] || 0;
                  return (
                    <div
                      key={t}
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '5px 2px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, display: 'block', color: tierColors[t] }}>
                        {t}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600, marginTop: '8px', textAlign: 'right' }}>
                Click for details ➔
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
