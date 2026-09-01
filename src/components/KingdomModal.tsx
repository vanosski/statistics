import React from 'react';
import type { KingdomSummary, Player } from '../types/stats';

interface KingdomModalProps {
  server: string | null;
  kingdoms: KingdomSummary[];
  players: Player[];
  onClose: () => void;
  onOpenPlayerProfile: (playerName: string) => void;
  onFilterTableToKd: (server: string) => void;
}

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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(4, 7, 18, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      className="animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(99, 102, 241, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ fontSize: '1.35rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            👑 Kingdom {server} Comprehensive Overview
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.25rem',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Tracked Players</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#a5b4fc' }}>{kdPlayers.length}</div>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Total Power</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981' }}>{kd.avg_total.toLocaleString()}</div>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Archer Pwr</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981' }}>{kd.avg_archer.toLocaleString()}</div>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Cav Pwr</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#3b82f6' }}>{kd.avg_cav.toLocaleString()}</div>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Siege Pwr</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ef4444' }}>{kd.avg_siege.toLocaleString()}</div>
            </div>
          </div>

          {/* Leaders */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px'
            }}
          >
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px' }}>🛡️ Key Battlefield Leaders</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  borderLeft: '3px solid #10b981'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Will of Caesar (WOC) Guard
                </span>
                <strong
                  style={{ color: '#fff', fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => onOpenPlayerProfile(topGuard.name)}
                >
                  {topGuard.name} ({topGuard.dgp.toLocaleString()} Guard Pwr) 🔍
                </strong>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  borderLeft: '3px solid #6366f1'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  #1 Total Power Attacker
                </span>
                <strong
                  style={{ color: '#fff', fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => onOpenPlayerProfile(topLeader.name)}
                >
                  {topLeader.name} ({topLeader.total_pow.toLocaleString()} Pwr) 🔍
                </strong>
              </div>
            </div>
          </div>

          {/* Roster table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff' }}>👥 Kingdom Roster ({kdPlayers.length})</h3>
            <button
              className="btn-toggle active"
              style={{ padding: '6px 14px', borderRadius: '16px' }}
              onClick={() => onFilterTableToKd(server)}
            >
              Filter in Main Table ➔
            </button>
          </div>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px'
            }}
          >
            <table style={{ width: '100%', minWidth: 'auto', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 41, 59, 0.9)' }}>
                  <th style={{ padding: '8px 12px' }}>Player</th>
                  <th style={{ padding: '8px 12px' }}>Total Pwr</th>
                  <th style={{ padding: '8px 12px' }}>Guard Pwr</th>
                  <th style={{ padding: '8px 12px' }}>Archer</th>
                  <th style={{ padding: '8px 12px' }}>Cav</th>
                  <th style={{ padding: '8px 12px' }}>Siege</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedByTot.map((p) => (
                  <tr key={p.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#fff' }}>
                      {p.name} {p.is_woc_leader ? '🛡️' : ''}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#a5b4fc', fontWeight: 700 }}>
                      {p.total_pow.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#f59e0b' }}>{p.dgp.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', color: '#10b981' }}>{p.archer_pow.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', color: '#3b82f6' }}>{p.cav_pow.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', color: '#ef4444' }}>{p.siege_pow.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        style={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: '1px solid rgba(99, 102, 241, 0.5)',
                          color: '#c7d2fe',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
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
  );
};
