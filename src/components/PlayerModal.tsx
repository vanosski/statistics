import React, { useState } from 'react';
import type { Player } from '../types/stats';
import { Radar } from 'react-chartjs-2';
import { Shield, Crosshair, Zap, Mountain, Swords, X } from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onAddToCompare: (playerName: string) => void;
}

// Max values across all players in the database
const DB_MAX: Record<string, number> = {
  inf_atk: 2620.7, inf_hp: 3039.5, inf_def: 2615.2, inf_dmg: 196.5, inf_dmgr: 236.5,
  inf_atk_bless: 900, inf_prot_bless: 900,
  arc_atk: 2778.5, arc_hp: 2082.7, arc_def: 1599.35, arc_dmg: 214.5, arc_dmgr: 196.5,
  arc_atk_bless: 900, arc_prot_bless: 900,
  cav_atk: 2988.35, cav_hp: 2145, cav_def: 1865.7, cav_dmg: 227.5, cav_dmgr: 197.5,
  cav_atk_bless: 900, cav_prot_bless: 900,
  sg_atk: 2473.55, sg_hp: 1625.2, sg_def: 1840.5, sg_dmg: 204.5, sg_dmgr: 194.5,
  sg_atk_bless: 900, sg_prot_bless: 900,
  troop_atk: 524.1, troop_hp: 494.1, troop_def: 514.1, troop_dmg: 47.5, troop_dmgr: 47.5,
  troop_atk_bless: 601, troop_prot_bless: 601,
};

const pct = (val: number, maxKey: string) =>
  Math.min(100, Math.round((val / (DB_MAX[maxKey] || 1)) * 100));

const StatBar = ({
  label, value, maxKey, color
}: { label: string; value: number; maxKey: string; color: string }) => {
  const p = pct(value, maxKey);
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
          <span style={{ fontSize: '0.96rem', fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>
            {value.toLocaleString()}%
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{p}th</span>
        </div>
      </div>
      <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${p}%`,
          background: `linear-gradient(90deg, ${color}60, ${color})`,
          borderRadius: '99px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>
    </div>
  );
};

type TabKey = 'infantry' | 'archer' | 'cavalry' | 'siege' | 'overall';

const TABS: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'infantry', label: 'Infantry', icon: <Shield size={14} style={{ filter: 'drop-shadow(0 0 4px rgba(165,180,252,0.8))' }} />, color: '#a5b4fc' },
  { key: 'archer',   label: 'Archer',   icon: <Crosshair size={14} style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.8))' }} />, color: '#10b981' },
  { key: 'cavalry',  label: 'Cavalry',  icon: <Zap size={14} style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.8))' }} />, color: '#3b82f6' },
  { key: 'siege',    label: 'Siege',    icon: <Mountain size={14} style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' }} />, color: '#ef4444' },
  { key: 'overall',  label: 'Overall',  icon: <Swords size={14} style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.8))' }} />, color: '#f59e0b' },
];

export const PlayerModal: React.FC<PlayerModalProps> = ({ player, onClose, onAddToCompare }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('infantry');
  if (!player) return null;

  const activeTabCfg = TABS.find(t => t.key === activeTab)!;

  const radarData = {
    labels: ['Archer', 'Cavalry', 'Siege', 'Guard', 'Infantry'],
    datasets: [{
      data: [
        Math.round((player.archer_pow / 4000) * 100),
        Math.round((player.cav_pow / 4000) * 100),
        Math.round((player.siege_pow / 4000) * 100),
        Math.round((player.dgp / 4000) * 100),
        Math.round(((player.total_pow / 3) / 4000) * 100), // proxy for infantry presence
      ],
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
      pointRadius: 3,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    layout: { padding: 20 },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(255,255,255,0.07)' },
        pointLabels: { color: '#94a3b8', font: { size: 11, family: "'Outfit', sans-serif" } },
        angleLines: { color: 'rgba(255,255,255,0.05)' },
      }
    }
  };

  const tabStats: Record<TabKey, { label: string; value: number; maxKey: string; color: string }[]> = {
    infantry: [
      { label: 'Attack',           value: player.inf_atk,       maxKey: 'inf_atk',       color: '#c7d2fe' },
      { label: 'HP',               value: player.inf_hp,        maxKey: 'inf_hp',         color: '#34d399' },
      { label: 'Defense',          value: player.inf_def,       maxKey: 'inf_def',        color: '#c7d2fe' },
      { label: 'Damage',           value: player.inf_dmg,       maxKey: 'inf_dmg',        color: '#fbbf24' },
      { label: 'Damage Received',  value: player.inf_dmgr,      maxKey: 'inf_dmgr',       color: '#34d399' },
      { label: 'ATK Blessing',     value: player.inf_atk_bless, maxKey: 'inf_atk_bless',  color: '#f59e0b' },
      { label: 'Prot Blessing',    value: player.inf_prot_bless,maxKey: 'inf_prot_bless', color: '#f59e0b' },
    ],
    archer: [
      { label: 'Attack',           value: player.arc_atk,       maxKey: 'arc_atk',        color: '#6ee7b7' },
      { label: 'HP',               value: player.arc_hp,        maxKey: 'arc_hp',          color: '#34d399' },
      { label: 'Defense',          value: player.arc_def,       maxKey: 'arc_def',         color: '#6ee7b7' },
      { label: 'Damage',           value: player.arc_dmg,       maxKey: 'arc_dmg',         color: '#fbbf24' },
      { label: 'Damage Received',  value: player.arc_dmgr || 0, maxKey: 'arc_dmgr',        color: '#34d399' },
      { label: 'ATK Blessing',     value: player.arc_atk_bless, maxKey: 'arc_atk_bless',   color: '#f59e0b' },
      { label: 'Prot Blessing',    value: player.arc_prot_bless || 0, maxKey: 'arc_prot_bless', color: '#f59e0b' },
    ],
    cavalry: [
      { label: 'Attack',           value: player.cav_atk,       maxKey: 'cav_atk',        color: '#93c5fd' },
      { label: 'HP',               value: player.cav_hp,        maxKey: 'cav_hp',          color: '#34d399' },
      { label: 'Defense',          value: player.cav_def,       maxKey: 'cav_def',         color: '#93c5fd' },
      { label: 'Damage',           value: player.cav_dmg,       maxKey: 'cav_dmg',         color: '#fbbf24' },
      { label: 'Damage Received',  value: player.cav_dmgr || 0, maxKey: 'cav_dmgr',        color: '#34d399' },
      { label: 'ATK Blessing',     value: player.cav_atk_bless, maxKey: 'cav_atk_bless',   color: '#f59e0b' },
      { label: 'Prot Blessing',    value: player.cav_prot_bless || 0, maxKey: 'cav_prot_bless', color: '#f59e0b' },
    ],
    siege: [
      { label: 'Attack',           value: player.sg_atk,        maxKey: 'sg_atk',         color: '#fca5a5' },
      { label: 'HP',               value: player.sg_hp,         maxKey: 'sg_hp',           color: '#34d399' },
      { label: 'Defense',          value: player.sg_def,        maxKey: 'sg_def',          color: '#fca5a5' },
      { label: 'Damage',           value: player.sg_dmg,        maxKey: 'sg_dmg',          color: '#fbbf24' },
      { label: 'Damage Received',  value: player.sg_dmgr || 0,  maxKey: 'sg_dmgr',         color: '#34d399' },
      { label: 'ATK Blessing',     value: player.sg_atk_bless || 0, maxKey: 'sg_atk_bless', color: '#f59e0b' },
      { label: 'Prot Blessing',    value: player.sg_prot_bless || 0, maxKey: 'sg_prot_bless', color: '#f59e0b' },
    ],
    overall: [
      { label: 'Attack',           value: player.troop_atk,          maxKey: 'troop_atk',       color: '#fcd34d' },
      { label: 'HP',               value: player.troop_hp,           maxKey: 'troop_hp',         color: '#34d399' },
      { label: 'Defense',          value: player.troop_def,          maxKey: 'troop_def',        color: '#fcd34d' },
      { label: 'Damage',           value: player.troop_dmg,          maxKey: 'troop_dmg',        color: '#fbbf24' },
      { label: 'Damage Received',  value: player.troop_dmgr || 0,    maxKey: 'troop_dmgr',       color: '#34d399' },
      { label: 'ATK Blessing',     value: player.troop_atk_bless || 0, maxKey: 'troop_atk_bless', color: '#f59e0b' },
      { label: 'Prot Blessing',    value: player.troop_prot_bless || 0, maxKey: 'troop_prot_bless', color: '#f59e0b' },
    ],
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(4, 7, 18, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px'
      }}
      className="animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="hide-scrollbar"
        style={{
          background: '#0d1321',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.95)',
          overflow: 'hidden'
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 22px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
                {player.name}
              </span>
              <span className="badge">{player.server}</span>
              {player.is_woc_leader && (
                <span style={{
                  fontSize: '0.75rem', color: '#34d399',
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                  padding: '2px 9px', borderRadius: '6px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Shield size={12} color="#34d399" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.8))' }} />
                  WOC Leader
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crosshair size={14} color="#ef4444" style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' }} /> 
                Lethal Hit <span style={{ color: '#f59e0b', fontWeight: 700 }}>{player.lethal}%</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b', fontSize: '1rem', width: '34px', height: '34px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0
            }}
          ><X size={18} /></button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>

          {/* ── Top Section: Power Cards + Radar ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            {/* Power cards */}
            <div style={{ flex: '1 1 300px', minWidth: 0, padding: '18px 22px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Combat Power</div>
              {/* Row 1: Total + Guard */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                {[
                  { label: 'Total Attack', value: player.total_pow, tier: `${player.total_pow_tier}`, tierColor: player.total_pow_color, accent: '#818cf8' },
                  { label: 'Guard (WOC)', value: player.dgp, accent: '#f59e0b' },
                ].map(c => (
                  <div key={c.label} style={{
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${c.accent}25`,
                    borderTop: `2px solid ${c.accent}`, borderRadius: '10px', padding: '12px'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{c.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.accent, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{c.value.toLocaleString()}</div>
                    {c.tier && <span className="tier-pill" style={{ background: c.tierColor, marginTop: '6px' }}>{c.tier}</span>}
                  </div>
                ))}
              </div>
              {/* Row 2: Archer + Cav + Siege */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Archer', value: player.archer_pow, tier: player.archer_pow_tier, tierColor: player.archer_pow_color, accent: '#10b981' },
                  { label: 'Cavalry', value: player.cav_pow, tier: player.cav_pow_tier, tierColor: player.cav_pow_color, accent: '#3b82f6' },
                  { label: 'Siege', value: player.siege_pow, tier: player.siege_pow_tier, tierColor: player.siege_pow_color, accent: '#ef4444' },
                ].map(c => (
                  <div key={c.label} style={{
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${c.accent}25`,
                    borderTop: `2px solid ${c.accent}`, borderRadius: '10px', padding: '12px'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{c.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.accent, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{c.value.toLocaleString()}</div>
                    <span className="tier-pill" style={{ background: c.tierColor, marginTop: '6px' }}>Tier {c.tier}</span>
                  </div>
                ))}
              </div>

              {/* Compare Button */}
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-toggle active"
                  style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.82rem' }}
                  onClick={() => onAddToCompare(player.name)}
                 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Swords size={14} style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} /> Add to Comparison
                </button>
              </div>
            </div>

            {/* Radar Chart */}
            <div style={{ flex: '1 1 240px', minWidth: '220px', padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', alignSelf: 'flex-start' }}>Unit Balance</div>
              <div style={{ width: '100%', maxWidth: '260px', aspectRatio: '1/1', position: 'relative' }}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', overflowX: 'auto' }} className="hide-scrollbar">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: '1 0 auto',
                    padding: '13px 12px',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                    background: isActive ? `${tab.color}10` : 'transparent',
                    color: isActive ? tab.color : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.82rem',
                    fontFamily: "'Outfit', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content: Progress Bars ── */}
          <div style={{ padding: '22px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.1rem' }}>{activeTabCfg.icon}</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: activeTabCfg.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {activeTabCfg.label} Stats
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
                Bar = percentile vs all tracked players
              </span>
            </div>
            {tabStats[activeTab].map(s => (
              <StatBar key={s.label} label={s.label} value={s.value} maxKey={s.maxKey} color={s.color} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
