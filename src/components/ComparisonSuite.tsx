import React, { useState } from 'react';
import type { Player, CompMetricType } from '../types/stats';
import { Radar, Bar } from 'react-chartjs-2';

interface ComparisonSuiteProps {
  selectedPlayers: Player[];
  onRemovePlayer: (name: string) => void;
  onClearAll: () => void;
}

export const ComparisonSuite: React.FC<ComparisonSuiteProps> = ({ selectedPlayers, onRemovePlayer, onClearAll }) => {
  const [metric, setMetric] = useState<CompMetricType>('powers');

  if (selectedPlayers.length === 0) {
    return null;
  }

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

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }} className="animate-fade-in">
      <div className="section-title">
        <span>⚔️ Multi-Player Direct Comparison Analysis ({selectedPlayers.length})</span>
        <button
          onClick={onClearAll}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Clear Comparison
        </button>
      </div>

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
    </div>
  );
};
