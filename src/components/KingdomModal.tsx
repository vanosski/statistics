import React from 'react';
import type { KingdomSummary, Player } from '../types/stats';
import { Crown, Shield, Swords, Search } from 'lucide-react';

interface KingdomModalProps {
  server: string | null;
  kingdoms: KingdomSummary[];
  players: Player[];
  onClose: () => void;
  onOpenPlayerProfile: (playerName: string) => void;
  onFilterTableToKd: (server: string) => void;
}

const KdStatCard = ({
  label, value, accent
}: { label: string, value: number | string, accent: string }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.7)',
    border: `1px solid ${accent}40`,
    borderLeft: `3px solid ${accent}`,
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: '1 1 140px'
  }}>
    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: accent, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

export const KingdomModal: React.FC<KingdomModalProps> = ({
  server,
  kingdoms,
  players,
  onClose,
  onOpenPlayerProfile,
  onFilterTableToKd
}) => {
  if (!server) return null;

  const kd = kingdoms.find((k) => k.server === server);
  const kdPlayers = players.filter((p) => p.server === server);

  if (!kd || kdPlayers.length === 0) return null;

  const sortedByTot = [...kdPlayers].sort((a, b) => b.total_pow - a.total_pow);
  const sortedByGuard = [...kdPlayers].sort((a, b) => b.dgp - a.dgp);
  const topLeader = sortedByTot[0];
  const topGuard = sortedByGuard[0];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(4, 7, 18, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
      className="animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #111827 0%, #0a0f1e 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.9)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={24} color="#fbbf24" style={{ marginRight: '8px', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }} /> Kingdom {server}
              </span>
              <span className="badge" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>Comprehensive Overview</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: '1.1rem', width: '38px', height: '38px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, marginTop: '2px'
            }}
          >✕</button>
        </div>

        {/* Scrollable Body */}
        <div className="hide-scrollbar" style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px', minHeight: 0 }}>
          
          {/* Summary Stats */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Averages & Totals</div>
            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <KdStatCard label="Tracked Players" value={kdPlayers.length} accent="#f43f5e" />
              <KdStatCard label="Avg Atk Power" value={kd.avg_total} accent="#818cf8" />
            </div>
            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <KdStatCard label="Avg Archer" value={kd.avg_archer} accent="#10b981" />
              <KdStatCard label="Avg Cavalry" value={kd.avg_cav} accent="#3b82f6" />
              <KdStatCard label="Avg Siege" value={kd.avg_siege} accent="#ef4444" />
            </div>
          </div>

          {/* Leaders */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Key Commanders</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={12} color="#10b981" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.8))' }} /> WILL OF CAESAR GUARD
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#f1f5f9', fontWeight: 700, marginBottom: '2px' }}>{topGuard.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}><strong style={{ color: '#f59e0b' }}>{topGuard.dgp.toLocaleString()}</strong> Guard Power</div>
                </div>
                <button
                  onClick={() => onOpenPlayerProfile(topGuard.name)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#c7d2fe', padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  <Search size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }} /> View
                </button>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Swords size={12} color="#818cf8" style={{ filter: 'drop-shadow(0 0 4px rgba(129,140,248,0.8))' }} /> #1 ATTACK POWER
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#f1f5f9', fontWeight: 700, marginBottom: '2px' }}>{topLeader.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}><strong style={{ color: '#818cf8' }}>{topLeader.total_pow.toLocaleString()}</strong> Attack Power</div>
                </div>
                <button
                  onClick={() => onOpenPlayerProfile(topLeader.name)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#c7d2fe', padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  <Search size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }} /> View
                </button>
              </div>

            </div>
          </div>

          {/* Roster Table */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Kingdom Roster</div>
              <button
                className="btn-toggle active"
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', flexShrink: 0 }}
                onClick={() => onFilterTableToKd(server)}
              >
                Filter Main Table ➔
              </button>
            </div>

            <div className="hide-scrollbar" style={{
              flex: 1,
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px'
            }}>
              <table style={{ width: '100%', minWidth: '600px', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Player</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Total Atk Pwr</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Guard Pwr</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Archer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Cav</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Siege</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByTot.map((p) => (
                    <tr key={p.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#f8fafc' }}>
                        {p.name} {p.is_woc_leader && <span title="WOC Leader"><Shield size={12} color="#10b981" style={{ marginLeft: '6px', marginBottom: '-2px', filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.8))' }} /></span>}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#a5b4fc', fontWeight: 700, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {p.total_pow.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#f59e0b', fontWeight: 600, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>{p.dgp.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', color: '#10b981', fontWeight: 600, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>{p.archer_pow.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', color: '#3b82f6', fontWeight: 600, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>{p.cav_pow.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', color: '#ef4444', fontWeight: 600, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>{p.siege_pow.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <button
                          style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8', padding: '4px 10px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.75rem'
                          }}
                          onClick={() => onOpenPlayerProfile(p.name)}
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
