import React, { useState } from 'react';
import type { Player, CompMetricType } from '../types/stats';
import { Radar, Bar } from 'react-chartjs-2';
import { Search, UserPlus, X, Trash2 } from 'lucide-react';

interface ComparisonSuiteProps {
  allPlayers: Player[];
  selectedPlayers: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (name: string) => void;
  onClearAll: () => void;
}

export const ComparisonSuite: React.FC<ComparisonSuiteProps> = ({
  allPlayers,
  selectedPlayers,
  onAddPlayer,
  onRemovePlayer,
  onClearAll
}) => {
  const [metric, setMetric] = useState<CompMetricType>('powers');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerServer, setPickerServer] = useState('ALL');
  const [showPickerDropdown, setShowPickerDropdown] = useState(false);

  const palette = [
    { bg: 'rgba(99, 102, 241, 0.35)', border: '#6366f1', solid: '#818cf8' },
    { bg: 'rgba(239, 68, 68, 0.35)', border: '#ef4444', solid: '#f87171' },
    { bg: 'rgba(16, 185, 129, 0.35)', border: '#10b981', solid: '#34d399' },
    { bg: 'rgba(245, 158, 11, 0.35)', border: '#f59e0b', solid: '#fbbf24' },
    { bg: 'rgba(59, 130, 246, 0.35)', border: '#3b82f6', solid: '#60a5fa' },
    { bg: 'rgba(236, 72, 153, 0.35)', border: '#ec4899', solid: '#f472b6' },
    { bg: 'rgba(139, 92, 246, 0.35)', border: '#8b5cf6', solid: '#a78bfa' },
    { bg: 'rgba(20, 184, 166, 0.35)', border: '#14b8a6', solid: '#2dd4bf' }
  ];

  // Candidates for quick player picker (exclude already selected)
  const selectedNames = new Set(selectedPlayers.map((p) => p.name));
  const pickerCandidates = allPlayers
    .filter((p) => {
      const matchesServer = pickerServer === 'ALL' || p.server === pickerServer;
      const matchesName = pickerSearch.trim() === '' || p.name.toLowerCase().includes(pickerSearch.toLowerCase());
      return !selectedNames.has(p.name) && matchesServer && matchesName;
    })
    .slice(0, 12);

  // Radar Data (Normalized 1/3 scale for balanced polygon visualization)
  const radarData = {
    labels: ['Guard Pwr (WOC)', 'Archer Pwr', 'Cav Pwr', 'Siege Pwr', 'Avg Unit Pwr (Tot/3)'],
    datasets: selectedPlayers.map((p, idx) => {
      const col = palette[idx % palette.length];
      return {
        label: `${p.name} (${p.server})`,
        data: [p.dgp, p.archer_pow, p.cav_pow, p.siege_pow, Math.round(p.total_pow / 3)],
        backgroundColor: col.bg,
        borderColor: col.border,
        borderWidth: 2,
        pointBackgroundColor: col.solid,
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
        _rawTotal: p.total_pow
      };
    })
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#e2e8f0', font: { size: 11, family: 'Outfit' }, boxWidth: 14 }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            if (context.dataIndex === 4) {
              const rawTot = context.dataset._rawTotal;
              return ` ${context.dataset.label} [Avg Unit Pwr]: ${context.formattedValue} (Total: ${rawTot.toLocaleString()})`;
            }
            return ` ${context.dataset.label}: ${context.formattedValue} Pwr`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: { color: '#a5b4fc', font: { size: 11, weight: 'bold' as const } },
        ticks: { color: '#64748b', backdropColor: 'transparent', font: { size: 9 } }
      }
    }
  };

  // Bar Data
  let barLabels: string[] = [];
  if (metric === 'powers') {
    barLabels = ['Guard Pwr', 'Archer Pwr', 'Cav Pwr', 'Siege Pwr', 'Total Pwr'];
  } else if (metric === 'guard_pool') {
    barLabels = ['Inf DEF %', 'Inf HP %', 'Troop DEF %', 'Troop HP %', 'Inf Prot Bless %', 'Inf DMG Recv %'];
  } else {
    barLabels = ['Arc ATK %', 'Arc DMG %', 'Cav ATK %', 'Cav DMG %', 'Sg ATK %', 'Sg DMG %', 'Troop ATK %'];
  }

  const barData = {
    labels: barLabels,
    datasets: selectedPlayers.map((p, idx) => {
      const col = palette[idx % palette.length];
      let data: number[] = [];
      if (metric === 'powers') {
        data = [p.dgp, p.archer_pow, p.cav_pow, p.siege_pow, p.total_pow];
      } else if (metric === 'guard_pool') {
        data = [p.inf_def, p.inf_hp, p.troop_def, p.troop_hp, p.inf_prot_bless, p.inf_dmgr];
      } else {
        data = [p.arc_atk, p.arc_dmg, p.cav_atk, p.cav_dmg, p.sg_atk, p.sg_dmg, p.troop_atk];
      }
      return {
        label: `${p.name} (${p.server})`,
        data,
        backgroundColor: col.solid,
        borderRadius: 6
      };
    })
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#e2e8f0', font: { size: 11 }, boxWidth: 14 }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' as const } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  // Matrix categories
  const statCategories = [
    {
      title: '👑 Core Powers & Kingdom',
      rows: [
        { label: 'Kingdom Server', key: 'server' as keyof Player, isNum: false },
        { label: 'Guard Power (🛡️ WOC)', key: 'dgp' as keyof Player, isNum: true },
        { label: 'Total Power', key: 'total_pow' as keyof Player, isNum: true },
        { label: 'Total Tier', key: 'total_pow_tier' as keyof Player, isNum: false },
        { label: 'Archer Power', key: 'archer_pow' as keyof Player, isNum: true },
        { label: 'Cav Power', key: 'cav_pow' as keyof Player, isNum: true },
        { label: 'Siege Power', key: 'siege_pow' as keyof Player, isNum: true },
        { label: 'Lethal Hit Rate', key: 'lethal' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: '🛡️ Guard & Infantry Defensive Attributes',
      rows: [
        { label: 'Infantry DEF', key: 'inf_def' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry HP', key: 'inf_hp' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry DMG Recv (Reduction)', key: 'inf_dmgr' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry Prot Blessing', key: 'inf_prot_bless' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry ATK', key: 'inf_atk' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry DMG', key: 'inf_dmg' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry ATK Blessing', key: 'inf_atk_bless' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: '⚔️ General Troop Attributes',
      rows: [
        { label: 'Troop ATK', key: 'troop_atk' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Troop HP', key: 'troop_hp' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Troop DEF', key: 'troop_def' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Troop DMG', key: 'troop_dmg' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Troop DMG Received', key: 'troop_dmgr' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Troop ATK Blessing', key: 'troop_atk_bless' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Troop Prot Blessing', key: 'troop_prot_bless' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: '🏹 Archer Attributes',
      rows: [
        { label: 'Archer ATK', key: 'arc_atk' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Archer HP', key: 'arc_hp' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Archer DEF', key: 'arc_def' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Archer DMG', key: 'arc_dmg' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Archer DMG Recv', key: 'arc_dmgr' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Archer ATK Blessing', key: 'arc_atk_bless' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Archer Prot Blessing', key: 'arc_prot_bless' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: '🐎 Cavalry Attributes',
      rows: [
        { label: 'Cavalry ATK', key: 'cav_atk' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Cavalry HP', key: 'cav_hp' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Cavalry DEF', key: 'cav_def' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Cavalry DMG', key: 'cav_dmg' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Cavalry DMG Recv', key: 'cav_dmgr' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Cavalry ATK Blessing', key: 'cav_atk_bless' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Cavalry Prot Blessing', key: 'cav_prot_bless' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: '🪨 Siege Attributes',
      rows: [
        { label: 'Siege ATK', key: 'sg_atk' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Siege HP', key: 'sg_hp' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Siege DEF', key: 'sg_def' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Siege DMG', key: 'sg_dmg' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Siege DMG Recv', key: 'sg_dmgr' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Siege ATK Blessing', key: 'sg_atk_bless' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Siege Prot Blessing', key: 'sg_prot_bless' as keyof Player, isNum: true, suffix: '%' }
      ]
    }
  ];

  const servers = ['ALL', 'K116', 'K138', 'K170', 'K176', 'K197', 'K54', 'K60', 'K91'];

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '36px' }} className="animate-fade-in">
      <div className="section-title">
        <span>⚔️ Multi-Player Comparison Suite</span>
        {selectedPlayers.length > 0 && (
          <button
            onClick={onClearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} /> Clear Selected ({selectedPlayers.length})
          </button>
        )}
      </div>

      {/* Dedicated Player Picker Bar */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.65)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '18px 20px',
          marginBottom: '22px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#818cf8" /> Choose Players to Compare:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Select from dropdown or search by name to instantly add to radar & stat matrix
            </span>
          </div>

          {/* Active Player Chips in Picker */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {selectedPlayers.map((p, idx) => {
              const col = palette[idx % palette.length];
              return (
                <span
                  key={p.name}
                  style={{
                    background: col.bg,
                    border: `1px solid ${col.solid}`,
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 12px ${col.bg}`
                  }}
                >
                  <span>{p.name}</span>
                  <span style={{ fontSize: '0.7rem', color: col.solid, background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                    {p.server}
                  </span>
                  <button
                    onClick={() => onRemovePlayer(p.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>

          {/* Picker Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', color: '#818cf8', pointerEvents: 'none', display: 'flex' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => {
                  setPickerSearch(e.target.value);
                  setShowPickerDropdown(true);
                }}
                onFocus={() => setShowPickerDropdown(true)}
                placeholder="Type player name to add (e.g. CerialKiller, Pain, Crozy)..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: '10px',
                  padding: '10px 14px 10px 38px',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />

              {/* Quick Candidates Dropdown */}
              {showPickerDropdown && pickerCandidates.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: '#0f172a',
                    border: '1px solid rgba(99, 102, 241, 0.45)',
                    borderRadius: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    zIndex: 200,
                    boxShadow: '0 14px 35px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  {pickerCandidates.map((p) => (
                    <div
                      key={p.name}
                      onClick={() => {
                        onAddPlayer(p.name);
                        setPickerSearch('');
                        setShowPickerDropdown(false);
                      }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        fontSize: '0.86rem',
                        color: '#fff',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        {p.is_woc_leader && <span style={{ fontSize: '0.75rem' }}>🛡️</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600 }}>{p.total_pow.toLocaleString()} Pwr</span>
                        <span className="badge">{p.server}</span>
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>+ Add</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ minWidth: '160px' }}>
              <select
                value={pickerServer}
                onChange={(e) => setPickerServer(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {servers.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'Filter by Server: All' : `Server: ${s}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* When no players selected */}
      {selectedPlayers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'var(--panel-bg)',
            border: '1px dashed rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚔️</div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '6px' }}>No Players Selected for Comparison</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 16px auto' }}>
            Use the search box above to add players, or pick players from the complete table to generate the comparison radar, bar charts, and side-by-side stat matrix.
          </p>
          <button
            className="btn-toggle active"
            style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem' }}
            onClick={() => {
              onAddPlayer('•Pain•');
              onAddPlayer('CerialKiller');
            }}
          >
            Load Top 2 KD Leaders Preview
          </button>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}
          >
            {/* Radar */}
            <div
              style={{
                background: 'var(--panel-bg)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                backdropFilter: 'blur(14px)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>🕸️ Unit Power Radar Breakdown</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guard vs Arch vs Cav vs Siege</span>
              </div>
              <div style={{ height: '360px', position: 'relative' }}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            {/* Bar */}
            <div
              style={{
                background: 'var(--panel-bg)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                backdropFilter: 'blur(14px)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px'
                }}
              >
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>📊 Head-to-Head Comparison</h3>
                <div className="btn-group">
                  {(['powers', 'guard_pool', 'attack_dmg'] as CompMetricType[]).map((m) => (
                    <button
                      key={m}
                      className={`btn-toggle ${metric === m ? 'active' : ''}`}
                      onClick={() => setMetric(m)}
                    >
                      {m === 'powers' ? 'Powers' : m === 'guard_pool' ? 'Guard Stats' : 'Offensive DMG'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: '360px', position: 'relative' }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Side-by-side matrix */}
          <div
            style={{
              background: 'var(--panel-bg)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backdropFilter: 'blur(14px)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>📑 Detailed Side-by-Side Attribute Comparison</h3>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                ✨ Green badge = Highest Value in Stat
              </span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '12px 14px' }}>Attribute / Metric</th>
                    {selectedPlayers.map((p, idx) => {
                      const col = palette[idx % palette.length];
                      return (
                        <th
                          key={p.name}
                          style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            padding: '12px 14px',
                            borderTop: `3px solid ${col.solid}`,
                            color: '#fff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              {p.name} <br />
                              <span style={{ fontSize: '0.7rem', color: col.solid }}>{p.server}</span>
                            </div>
                            <button
                              onClick={() => onRemovePlayer(p.name)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {statCategories.map((cat) => (
                    <React.Fragment key={cat.title}>
                      <tr>
                        <td
                          colSpan={selectedPlayers.length + 1}
                          style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            color: '#a5b4fc',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            padding: '8px 14px',
                            borderLeft: '3px solid #6366f1'
                          }}
                        >
                          {cat.title}
                        </td>
                      </tr>
                      {cat.rows.map((row) => {
                        let maxVal = -Infinity;
                        if (row.isNum && selectedPlayers.length > 1) {
                          selectedPlayers.forEach((p) => {
                            const v = Number(p[row.key]) || 0;
                            if (v > maxVal) maxVal = v;
                          });
                        }

                        return (
                          <tr key={row.label}>
                            <td style={{ color: '#94a3b8', padding: '10px 14px' }}>{row.label}</td>
                            {selectedPlayers.map((p) => {
                              const rawVal = p[row.key];
                              const isWinner =
                                row.isNum &&
                                selectedPlayers.length > 1 &&
                                Number(rawVal) === maxVal &&
                                maxVal > 0;
                              const displayVal =
                                row.isNum && typeof rawVal === 'number'
                                  ? rawVal.toLocaleString() + (row.suffix || '')
                                  : String(rawVal);

                              return (
                                <td key={p.name} style={{ padding: '10px 14px' }}>
                                  {isWinner ? (
                                    <span
                                      style={{
                                        color: '#10b981',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        borderRadius: '4px',
                                        padding: '2px 6px'
                                      }}
                                    >
                                      {displayVal} 👑
                                    </span>
                                  ) : (
                                    <span style={{ color: '#fff' }}>{displayVal}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
