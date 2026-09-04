import React, { useState, useRef, useEffect } from 'react';
import type { Player, CompMetricType } from '../types/stats';
import { Radar, Bar } from 'react-chartjs-2';
import { Search, ChevronDown, X, Trash2, CheckSquare, Square, Eye, EyeOff, Shield, Crosshair, Zap, Mountain, Swords, Crown, Target, Hexagon, Lock, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const { isApproved } = useAuth();
  const [metric, setMetric] = useState<CompMetricType>('powers');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serverFilter, setServerFilter] = useState('ALL');
  // Mobile focus toggle: focus on one player's polygon or show all
  const [focusedPlayer, setFocusedPlayer] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const selectedNames = new Set(selectedPlayers.map((p) => p.name));

  // Filter all players for checkbox dropdown
  const filteredPlayers = allPlayers.filter((p) => {
    const matchesServer = serverFilter === 'ALL' || p.server === serverFilter;
    const matchesName = searchQuery.trim() === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesServer && matchesName;
  });

  const togglePlayerSelection = (name: string) => {
    if (selectedNames.has(name)) {
      onRemovePlayer(name);
    } else {
      onAddPlayer(name);
    }
  };

  // Radar Data with Mobile Focus Dimming
  const radarData = {
    labels: ['Guard (WOC)', 'Archer', 'Cavalry', 'Siege', 'Avg Unit Pwr'],
    datasets: selectedPlayers.map((p, idx) => {
      const col = palette[idx % palette.length];
      const isFocused = !focusedPlayer || focusedPlayer === p.name;

      return {
        label: `${p.name} (${p.server})`,
        data: [p.dgp, p.archer_pow, p.cav_pow, p.siege_pow, Math.round(p.total_pow / 3)],
        backgroundColor: isFocused ? col.bg : 'rgba(255,255,255,0.02)',
        borderColor: isFocused ? col.border : 'rgba(255,255,255,0.1)',
        borderWidth: isFocused ? 2.5 : 1,
        pointBackgroundColor: isFocused ? col.solid : 'rgba(255,255,255,0.2)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointRadius: isFocused ? 5 : 2,
        _rawTotal: p.total_pow
      };
    })
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We use our custom clean interactive mobile-friendly legend pills
      },
      tooltip: {
        backgroundColor: '#0a0f1d',
        borderColor: '#6366f1',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, family: 'Space Grotesk', weight: 'bold' as const },
        bodyFont: { size: 12, family: 'Space Grotesk' },
        callbacks: {
          label: (context: any) => {
            if (context.dataIndex === 4) {
              const rawTot = context.dataset._rawTotal;
              return ` ${context.dataset.label}: ${context.formattedValue} (Total Atk: ${rawTot.toLocaleString()})`;
            }
            return ` ${context.dataset.label}: ${context.formattedValue} Pwr`;
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: '#c7d2fe',
          font: { size: 11, weight: 'bold' as const, family: 'Space Grotesk' },
          padding: 8
        },
        ticks: {
          color: '#64748b',
          backdropColor: 'transparent',
          font: { size: 9 },
          showLabelBackdrop: false
        }
      }
    }
  };

  // Bar Data
  let barLabels: string[] = [];
  if (metric === 'powers') {
    barLabels = ['Guard Pwr', 'Archer Pwr', 'Cav Pwr', 'Siege Pwr', 'Avg Unit (Tot/3)'];
  } else if (metric === 'guard_pool') {
    barLabels = ['Inf DEF %', 'Inf HP %', 'Troop DEF %', 'Troop HP %', 'Inf Prot Bless %', 'Inf DMG Recv %'];
  } else {
    barLabels = ['Arc ATK %', 'Arc DMG %', 'Cav ATK %', 'Cav DMG %', 'Sg ATK %', 'Sg DMG %', 'Troop ATK %'];
  }

  const barData = {
    labels: barLabels,
    datasets: selectedPlayers.map((p, idx) => {
      const col = palette[idx % palette.length];
      const isFocused = !focusedPlayer || focusedPlayer === p.name;
      let data: number[] = [];
      if (metric === 'powers') {
        data = [p.dgp, p.archer_pow, p.cav_pow, p.siege_pow, Math.round(p.total_pow / 3)];
      } else if (metric === 'guard_pool') {
        data = [p.inf_def, p.inf_hp, p.troop_def, p.troop_hp, p.inf_prot_bless, p.inf_dmgr];
      } else {
        data = [p.arc_atk, p.arc_dmg, p.cav_atk, p.cav_dmg, p.sg_atk, p.sg_dmg, p.troop_atk];
      }
      return {
        label: `${p.name} (${p.server})`,
        data,
        backgroundColor: isFocused ? col.solid : 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        _rawTotal: p.total_pow
      };
    })
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#e2e8f0', font: { size: 11, family: 'Space Grotesk' }, boxWidth: 12 }
      },
      tooltip: {
        backgroundColor: '#0a0f1d',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            if (metric === 'powers' && context.dataIndex === 4) {
              const rawTot = context.dataset._rawTotal;
              return ` ${context.dataset.label} [Avg Unit Pwr]: ${context.formattedValue} (Total Atk: ${rawTot.toLocaleString()})`;
            }
            return ` ${context.dataset.label}: ${context.formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' as const, family: 'Space Grotesk' } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Space Grotesk' } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  // Matrix categories
  const statCategories = [
    {
      title: <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Crown size={14} color="#fbbf24" style={{filter:'drop-shadow(0 0 4px rgba(251,191,36,0.8))'}}/> Core Powers & Kingdom</span>,
      rows: [
        { label: 'Kingdom Server', key: 'server' as keyof Player, isNum: false },
        { label: 'Guard Power (WOC)', key: 'dgp' as keyof Player, isNum: true },
        { label: 'Total Attack Power', key: 'total_pow' as keyof Player, isNum: true },
        { label: 'Total Atk Tier', key: 'total_pow_tier' as keyof Player, isNum: false },
        { label: 'Archer Power', key: 'archer_pow' as keyof Player, isNum: true },
        { label: 'Cav Power', key: 'cav_pow' as keyof Player, isNum: true },
        { label: 'Siege Power', key: 'siege_pow' as keyof Player, isNum: true },
        { label: 'Lethal Hit Rate', key: 'lethal' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Shield size={14} color="#10b981" style={{filter:'drop-shadow(0 0 4px rgba(16,185,129,0.8))'}}/> Guard & Infantry Defensive Attributes</span>,
      rows: [
        { label: 'Infantry ATK', key: 'inf_atk' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry HP', key: 'inf_hp' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry DEF', key: 'inf_def' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry DMG', key: 'inf_dmg' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry DMG Recv (Reduction)', key: 'inf_dmgr' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry ATK Blessing', key: 'inf_atk_bless' as keyof Player, isNum: true, suffix: '%' },
        { label: 'Infantry Prot Blessing', key: 'inf_prot_bless' as keyof Player, isNum: true, suffix: '%' }
      ]
    },
    {
      title: <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Swords size={14} color="#c7d2fe" style={{filter:'drop-shadow(0 0 4px rgba(199,210,254,0.8))'}}/> General Troop Attributes</span>,
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

  const servers = ['ALL', ...Array.from(new Set(allPlayers.map((p) => p.server))).sort()];

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '40px', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
      <div className="section-title">
        <span style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}><Swords size={20} color="#818cf8" style={{filter:'drop-shadow(0 0 5px rgba(129,140,248,0.8))'}}/> Multi-Player Comparison Suite</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
          Select multiple players to compare radar polygons, unit head-to-head, and full attribute breakdown
        </span>
      </div>

      {/* Control Panel: Searchable Checkbox Dropdown Picker */}
      <div
        className="cyber-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'visible',
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crosshair size={18} color="#ef4444" style={{filter:'drop-shadow(0 0 5px rgba(239,68,68,0.8))'}}/> Compare Selected Players ({selectedPlayers.length} Active):
          </span>
          {selectedPlayers.length > 0 && (
            <button
              onClick={onClearAll}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={13} /> Clear All
            </button>
          )}
        </div>

        {/* Dropdown Box Wrapper */}
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%',
              minHeight: '48px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: dropdownOpen ? '1px solid #6366f1' : '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: dropdownOpen ? '0 0 0 3px rgba(99, 102, 241, 0.25)' : 'inset 0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', flex: 1 }}>
              {selectedPlayers.length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '4px' }}>
                  Click here to search & check players to compare...
                </span>
              ) : (
                selectedPlayers.map((p, idx) => {
                  const col = palette[idx % palette.length];
                  return (
                    <span
                      key={p.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePlayer(p.name);
                      }}
                      style={{
                        background: col.bg,
                        border: `1px solid ${col.solid}`,
                        color: '#fff',
                        padding: '3px 10px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{p.name}</span>
                      <span style={{ fontSize: '0.68rem', color: col.solid }}>({p.server})</span>
                      <X size={12} color="#fca5a5" />
                    </span>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', paddingLeft: '8px' }}>
              <ChevronDown size={18} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
          </div>

          {/* Dropdown Menu with Search & Checkboxes */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#0a0f1d',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '14px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 25px rgba(99, 102, 241, 0.3)',
                zIndex: 9999,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Search Bar & Kingdom Filter Inside Dropdown */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '10px', color: '#818cf8', pointerEvents: 'none' }}>
                    <Search size={15} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player name..."
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 10px 8px 32px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <select
                  value={serverFilter}
                  onChange={(e) => setServerFilter(e.target.value)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {servers.map((s) => (
                    <option key={s} value={s}>
                      {s === 'ALL' ? 'All Servers' : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scrollable Checkbox List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredPlayers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No players match "{searchQuery}"
                  </div>
                ) : (
                  filteredPlayers.map((p) => {
                    const isChecked = selectedNames.has(p.name);
                    return (
                      <div
                        key={p.name}
                        onClick={() => togglePlayerSelection(p.name)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: isChecked ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: isChecked ? '#818cf8' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                          </span>
                          <span style={{ fontWeight: 600, color: isChecked ? '#fff' : '#cbd5e1', fontSize: '0.88rem' }}>
                            {p.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge">{p.server}</span>
                          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                            {p.total_pow.toLocaleString()} Pwr
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* When no players selected */}
      {selectedPlayers.length === 0 ? (
        <div
          className="cyber-panel"
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            border: '1px dashed rgba(99, 102, 241, 0.4)',
            borderRadius: '16px',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ marginBottom: '16px' }}><Swords size={48} color="#6366f1" style={{filter:'drop-shadow(0 0 10px rgba(99,102,241,0.6))'}}/></div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '6px', fontWeight: 800 }}>No Players Selected</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
            Click the searchable dropdown above and select the players you wish to compare side-by-side.
          </p>
          <button
            className="btn-toggle active"
            style={{ padding: '9px 24px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700 }}
            onClick={() => {
              const topGuards = [...allPlayers]
                .filter(p => p.is_woc_leader)
                .sort((a, b) => b.dgp - a.dgp)
                .slice(0, 2);
              topGuards.forEach(p => onAddPlayer(p.name));
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}
          >
            {/* 1. Radar Breakdown Card with Mobile Focus Toggles */}
            <div
              className="cyber-panel"
              style={{
                padding: '20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}><Hexagon size={16} color="#10b981" style={{filter:'drop-shadow(0 0 4px rgba(16,185,129,0.8))'}}/> Unit Power Radar</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Normalized 5-Axis Scale</span>
                </div>

                {focusedPlayer && (
                  <button
                    onClick={() => setFocusedPlayer(null)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid #818cf8',
                      color: '#c7d2fe',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Focus (Show All)
                  </button>
                )}
              </div>

              {/* Interactive Player Legend Pills (Click to isolate/focus on Mobile) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedPlayers.map((p, idx) => {
                  const col = palette[idx % palette.length];
                  const isFocused = focusedPlayer === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setFocusedPlayer(isFocused ? null : p.name)}
                      style={{
                        background: isFocused ? col.solid : col.bg,
                        border: `1px solid ${col.solid}`,
                        color: isFocused ? '#000' : '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isFocused ? <Eye size={12} /> : <EyeOff size={12} style={{ opacity: 0.6 }} />}
                      <span>{p.name}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({p.server})</span>
                    </button>
                  );
                })}
              </div>

              {/* Radar Chart Container */}
              <div style={{ height: '340px', width: '100%', position: 'relative' }}>
                <Radar data={radarData} options={radarOptions} />
              </div>

              {/* Mobile Quick-Stats Strip (Direct values under radar) */}
              <div
                style={{
                  background: 'rgba(10, 15, 28, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Radar Breakdown Numbers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                  {selectedPlayers.map((p, idx) => {
                    const col = palette[idx % palette.length];
                    return (
                      <div
                        key={p.name}
                        onClick={() => setFocusedPlayer(focusedPlayer === p.name ? null : p.name)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: focusedPlayer === p.name ? 'rgba(99, 102, 241, 0.2)' : 'transparent'
                        }}
                      >
                        <span style={{ color: col.solid, fontWeight: 700 }}>{p.name}:</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>
                          <Shield size={12} style={{display:'inline', marginBottom:'-2px'}}/> {p.dgp.toLocaleString()} | <Target size={12} style={{display:'inline', marginBottom:'-2px'}}/> {p.archer_pow.toLocaleString()} | <Zap size={12} style={{display:'inline', marginBottom:'-2px'}}/> {p.cav_pow.toLocaleString()} | <Mountain size={12} style={{display:'inline', marginBottom:'-2px'}}/> {p.siege_pow.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Head-to-Head Bar Chart */}
            <div
              className="cyber-panel"
              style={{
                padding: '20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 800 }}><BarChart2 size={18} style={{ display: 'inline', marginBottom: '-2px', color: '#38bdf8' }} /> Head-to-Head Comparison</h3>
                <div className="btn-group" style={{ maxWidth: '100%' }}>
                  {(['powers', 'guard_pool', 'attack_dmg'] as CompMetricType[]).map((m) => (
                    <button
                      key={m}
                      className={`btn-toggle ${metric === m ? 'active' : ''}`}
                      onClick={() => setMetric(m)}
                    >
                      {m === 'powers' ? 'Powers' : m === 'guard_pool' ? (!isApproved ? '🔒 Guard' : 'Guard') : (!isApproved ? '🔒 DMG %' : 'DMG %')}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: '360px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {!isApproved && metric !== 'powers' ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Lock size={48} color="#f472b6" style={{ margin: '0 auto 12px auto', filter: 'drop-shadow(0 0 8px rgba(244,114,182,0.8))' }} />
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Advanced Charts Locked</h3>
                    <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto 16px auto' }}>Login to view in-depth Guard and Damage % statistics.</p>
                    <button
                      onClick={() => window.location.hash = 'login'}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Login Now
                    </button>
                  </div>
                ) : (
                  <Bar data={barData} options={barOptions} />
                )}
              </div>
            </div>
          </div>

          {/* 3. Detailed Side-by-Side Matrix Table (Protected) */}
          {isApproved ? (
            <div
              className="cyber-panel"
              style={{
                padding: '20px',
                boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={18} color="#c7d2fe" style={{filter:'drop-shadow(0 0 4px rgba(199,210,254,0.8))'}}/> Detailed Side-by-Side Attribute Comparison</h3>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                  ✨ <Crown size={12} color="#fbbf24" style={{display:'inline', marginBottom:'-2px', filter:'drop-shadow(0 0 4px rgba(251,191,36,0.8))'}}/> Badge = Highest Value in Stat
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  borderRadius: '12px',
                  background: 'rgba(10, 15, 28, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
              <table className="comp-table" style={{ width: '100%', minWidth: selectedPlayers.length > 2 ? '600px' : '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      className="comp-th attr-col"
                      style={{
                        background: 'rgba(20, 29, 53, 0.95)',
                        textAlign: 'left',
                        color: '#94a3b8',
                        fontWeight: 700,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Attribute / Metric
                    </th>
                    {selectedPlayers.map((p, idx) => {
                      const col = palette[idx % palette.length];
                      return (
                        <th
                          key={p.name}
                          className="comp-th player-col"
                          style={{
                            background: 'rgba(20, 29, 53, 0.95)',
                            borderTop: `3px solid ${col.solid}`,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>{p.name}</div>
                              <span style={{ fontSize: '0.72rem', color: col.solid, fontWeight: 700 }}>{p.server}</span>
                            </div>
                            <button
                              onClick={() => onRemovePlayer(p.name)}
                              title="Remove player"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                padding: '3px 7px',
                                fontSize: '0.8rem',
                                transition: 'all 0.15s ease'
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
                  {statCategories.map((cat, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td
                          colSpan={selectedPlayers.length + 1}
                          className="comp-td comp-cat-header"
                          style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            borderTop: idx !== 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            color: '#e2e8f0',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {cat.title}
                        </td>
                      </tr>
                      {cat.rows.map((row, rIdx) => {
                        let maxVal = -Infinity;
                        if (row.isNum && selectedPlayers.length > 1) {
                          selectedPlayers.forEach((p) => {
                            const v = Number(p[row.key]) || 0;
                            if (v > maxVal) maxVal = v;
                          });
                        }

                        const isEven = rIdx % 2 === 0;

                        return (
                          <tr
                            key={row.label}
                            style={{
                              background: isEven ? 'rgba(15, 23, 42, 0.4)' : 'rgba(22, 31, 49, 0.3)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <td
                              className="comp-td attr-col"
                              style={{
                                color: '#cbd5e1',
                                fontWeight: 700,
                                borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                              }}
                            >
                              {row.label}
                            </td>
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
                                <td
                                  key={p.name}
                                  className="comp-td"
                                >
                                  {isWinner ? (
                                    <span
                                      style={{
                                        color: '#34d399',
                                        fontWeight: 800,
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid rgba(16, 185, 129, 0.35)',
                                        borderRadius: '6px',
                                        padding: '3px 8px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {displayVal} <span style={{ marginLeft: '4px' }}><Crown size={14} color="#fbbf24" style={{display:'inline', marginBottom:'-2px', filter:'drop-shadow(0 0 4px rgba(251,191,36,0.8))'}}/></span>
                                    </span>
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{displayVal}</span>
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
          ) : (
            <div
              className="cyber-panel"
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                border: '1px dashed rgba(236, 72, 153, 0.4)'
              }}
            >
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '8px' }}>
                <Lock size={32} color="#f472b6" style={{ filter: 'drop-shadow(0 0 8px rgba(244,114,182,0.8))' }} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>Detailed Stats Matrix Locked</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>
                The deep dive comparison matrix (with exact percentages and troop-specific defensive attributes) is exclusively available to verified alliance members.
              </p>
              <button
                onClick={() => window.location.hash = 'login'}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '12px',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                }}
              >
                Login to Unlock Detailed Stats
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
