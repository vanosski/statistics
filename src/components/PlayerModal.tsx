import React from 'react';
import type { Player } from '../types/stats';

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onAddToCompare: (playerName: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ player, onClose, onAddToCompare }) => {
  if (!player) return null;

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
      className="animate-fade-in modal-container"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-sheet"
        style={{
          background: '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(99, 102, 241, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '18px 24px',
            background: 'rgba(30, 41, 59, 0.85)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 {player.name}
            </h2>
            <span className="badge" style={{ fontSize: '0.8rem', padding: '3px 10px' }}>{player.server}</span>
            {player.is_woc_leader && (
              <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '6px' }}>
                🛡️ WOC Leader
              </span>
            )}
            <span
              style={{
                fontSize: '0.8rem',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              🎯 Lethal Hit: {player.lethal}%
            </span>
          </div>

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
          {/* Core Powers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Attack Power</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a5b4fc' }}>{player.total_pow.toLocaleString()}</div>
              <span className="tier-pill" style={{ background: player.total_pow_color, marginTop: '4px' }}>
                Tier {player.total_pow_tier}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Guard Power (🛡️ WOC)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>{player.dgp.toLocaleString()}</div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Archer Power</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{player.archer_pow.toLocaleString()}</div>
              <span className="tier-pill" style={{ background: player.archer_pow_color, marginTop: '4px' }}>
                Tier {player.archer_pow_tier}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cavalry Power</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{player.cav_pow.toLocaleString()}</div>
              <span className="tier-pill" style={{ background: player.cav_pow_color, marginTop: '4px' }}>
                Tier {player.cav_pow_tier}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Siege Power</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{player.siege_pow.toLocaleString()}</div>
              <span className="tier-pill" style={{ background: player.siege_pow_color, marginTop: '4px' }}>
                Tier {player.siege_pow_tier}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-toggle active"
              style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem' }}
              onClick={() => onAddToCompare(player.name)}
            >
              ⚔️ Add to Multi-Player Comparison
            </button>
          </div>

          {/* Detailed stats in distinct separate clean cards with strict uniform order:
              Attack, Health, Defense, Damage, Damage Recv, Attack Blessing, Protection Blessing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {/* Infantry / Guard */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <h4 style={{ color: '#a5b4fc', marginBottom: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
                🛡️ Infantry & Guard
              </h4>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.85, color: '#cbd5e1' }}>
                ATK: <strong style={{ color: '#fff' }}>{player.inf_atk}%</strong><br />
                HP: <strong style={{ color: '#fff' }}>{player.inf_hp}%</strong><br />
                DEF: <strong style={{ color: '#fff' }}>{player.inf_def}%</strong><br />
                DMG: <strong style={{ color: '#fff' }}>{player.inf_dmg}%</strong><br />
                DMG Recv: <strong style={{ color: '#10b981' }}>{player.inf_dmgr}%</strong><br />
                ATK Bless: <strong style={{ color: '#fff' }}>{player.inf_atk_bless}%</strong><br />
                Prot Bless: <strong style={{ color: '#fff' }}>{player.inf_prot_bless}%</strong>
              </div>
            </div>

            {/* Archer */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <h4 style={{ color: '#10b981', marginBottom: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
                🏹 Archer
              </h4>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.85, color: '#cbd5e1' }}>
                ATK: <strong style={{ color: '#fff' }}>{player.arc_atk}%</strong><br />
                HP: <strong style={{ color: '#fff' }}>{player.arc_hp}%</strong><br />
                DEF: <strong style={{ color: '#fff' }}>{player.arc_def}%</strong><br />
                DMG: <strong style={{ color: '#fff' }}>{player.arc_dmg}%</strong><br />
                DMG Recv: <strong style={{ color: '#fff' }}>{player.arc_dmgr || 0}%</strong><br />
                ATK Bless: <strong style={{ color: '#fff' }}>{player.arc_atk_bless}%</strong><br />
                Prot Bless: <strong style={{ color: '#fff' }}>{player.arc_prot_bless || 0}%</strong>
              </div>
            </div>

            {/* Cavalry */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <h4 style={{ color: '#3b82f6', marginBottom: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
                🐎 Cavalry
              </h4>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.85, color: '#cbd5e1' }}>
                ATK: <strong style={{ color: '#fff' }}>{player.cav_atk}%</strong><br />
                HP: <strong style={{ color: '#fff' }}>{player.cav_hp}%</strong><br />
                DEF: <strong style={{ color: '#fff' }}>{player.cav_def}%</strong><br />
                DMG: <strong style={{ color: '#fff' }}>{player.cav_dmg}%</strong><br />
                DMG Recv: <strong style={{ color: '#fff' }}>{player.cav_dmgr || 0}%</strong><br />
                ATK Bless: <strong style={{ color: '#fff' }}>{player.cav_atk_bless}%</strong><br />
                Prot Bless: <strong style={{ color: '#fff' }}>{player.cav_prot_bless || 0}%</strong>
              </div>
            </div>

            {/* Siege */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <h4 style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
                🪨 Siege
              </h4>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.85, color: '#cbd5e1' }}>
                ATK: <strong style={{ color: '#fff' }}>{player.sg_atk}%</strong><br />
                HP: <strong style={{ color: '#fff' }}>{player.sg_hp}%</strong><br />
                DEF: <strong style={{ color: '#fff' }}>{player.sg_def}%</strong><br />
                DMG: <strong style={{ color: '#fff' }}>{player.sg_dmg}%</strong><br />
                DMG Recv: <strong style={{ color: '#fff' }}>{player.sg_dmgr || 0}%</strong><br />
                ATK Bless: <strong style={{ color: '#fff' }}>{player.sg_atk_bless || 0}%</strong><br />
                Prot Bless: <strong style={{ color: '#fff' }}>{player.sg_prot_bless || 0}%</strong>
              </div>
            </div>

            {/* Overall Troop Attributes */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <h4 style={{ color: '#f59e0b', marginBottom: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
                ⚔️ Overall Troop
              </h4>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.85, color: '#cbd5e1' }}>
                ATK: <strong style={{ color: '#fff' }}>{player.troop_atk}%</strong><br />
                HP: <strong style={{ color: '#fff' }}>{player.troop_hp}%</strong><br />
                DEF: <strong style={{ color: '#fff' }}>{player.troop_def}%</strong><br />
                DMG: <strong style={{ color: '#fff' }}>{player.troop_dmg}%</strong><br />
                DMG Recv: <strong style={{ color: '#fff' }}>{player.troop_dmgr || 0}%</strong><br />
                ATK Bless: <strong style={{ color: '#fff' }}>{player.troop_atk_bless || 0}%</strong><br />
                Prot Bless: <strong style={{ color: '#fff' }}>{player.troop_prot_bless || 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
