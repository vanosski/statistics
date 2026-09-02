import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Player } from '../types/stats';
import { Search, Settings } from 'lucide-react';


interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selected, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: selected.length > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
          border: selected.length > 0 ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
          color: selected.length > 0 ? '#c7d2fe' : '#94a3b8',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.15s ease'
        }}
      >
        {label} {selected.length > 0 && `(${selected.length})`}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: '#0f172a',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            zIndex: 50,
            minWidth: '180px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {options.map((opt) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: '#cbd5e1'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                style={{ cursor: 'pointer', accentColor: '#6366f1' }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

interface PlayerTableProps {
  players: Player[];
  selectedPlayerNames: Set<string>;
  onAddPlayerTag: (name: string) => void;
  onRemovePlayerTag: (name: string) => void;
  onClearAllTags: () => void;
  onOpenPlayerModal: (name: string) => void;
  filters?: import('../types/stats').TableFilters;
  onFiltersChange?: (filters: import('../types/stats').TableFilters) => void;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  selectedPlayerNames,
  onAddPlayerTag,
  onRemovePlayerTag,
  onClearAllTags,
  onOpenPlayerModal,
  filters = { servers: [], tiers: [], classes: [], wocOnly: false, tierType: 'total_pow' },
  onFiltersChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<keyof Player>('dgp');
  const [sortAsc, setSortAsc] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Suggestions for autocomplete
  const currentToken = searchTerm.split(',').pop()?.trim().toLowerCase() || '';
  const suggestions =
    currentToken.length > 0
      ? players
          .filter((p) => p.name.toLowerCase().includes(currentToken) && !selectedPlayerNames.has(p.name))
          .slice(0, 8)
      : [];

  const handleSort = (col: keyof Player) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    if (!onFiltersChange) return;
    const currentList = filters[type as keyof typeof filters] as string[];
    const isSelected = currentList.includes(value);
    
    let newList;
    if (isSelected) {
      newList = currentList.filter(item => item !== value);
    } else {
      newList = [...currentList, value];
    }
    
    onFiltersChange({
      ...filters,
      [type]: newList
    });
  };



  // Filter logic
  const queryTokens = searchTerm
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const filteredPlayers = players.filter((p) => {
    // 1. Kingdom Filter
    const matchesServer = filters.servers.length === 0 || filters.servers.includes(p.server);
    if (!matchesServer) return false;



    // 3. Tier Filter
    if (filters.tiers.length > 0) {
      const tierField = filters.tierType === 'total_pow' ? p.total_pow_tier : 
                       filters.tierType === 'archer_pow' ? p.archer_pow_tier :
                       filters.tierType === 'cav_pow' ? p.cav_pow_tier : p.siege_pow_tier;
      if (!filters.tiers.includes(tierField)) return false;
    }

    // 4. WOC Only Filter
    if (filters.wocOnly && !p.is_woc_leader) return false;

    // 5. Explicit Tags / Search
    if (selectedPlayerNames.size > 0) {
      if (!selectedPlayerNames.has(p.name)) return false;
    } else if (queryTokens.length > 0) {
      const matchesToken = queryTokens.some((token) => p.name.toLowerCase().includes(token));
      if (!matchesToken) return false;
    }

    return true;
  });

  // Sort logic
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];

    if (valA === null || valA === undefined) valA = 0;
    if (valB === null || valB === undefined) valB = 0;

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });


  return (
    <div id="playerTableSection" style={{ width: '100%', maxWidth: '1400px', marginBottom: '40px' }}>
      <div className="section-title">
        <span>📋 Complete All-Attribute Player Table ({sortedPlayers.length})</span>
      </div>

      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          width: '100%',
          marginBottom: '20px',
          flexDirection: 'column',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          backdropFilter: 'blur(16px)',
          padding: '18px 20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 20
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Tag chips */}
          {selectedPlayerNames.size > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {Array.from(selectedPlayerNames).map((name) => (
                <span
                  key={name}
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.4))',
                    border: '1px solid rgba(139, 92, 246, 0.6)',
                    color: '#fff',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                  }}
                >
                  {name}
                  <button
                    onClick={() => onRemovePlayerTag(name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 700
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={onClearAllTags}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Search container */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                color: '#818cf8',
                fontSize: '1rem',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentToken.length > 0) {
                  const match = players.find((p) => p.name.toLowerCase() === currentToken);
                  if (match) {
                    onAddPlayerTag(match.name);
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }
                }
              }}
              placeholder="Search player by name to compare (select suggestions or comma-separated)..."
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '10px',
                padding: '12px 14px 12px 42px',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#0f172a',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '10px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: '0 14px 35px rgba(0, 0, 0, 0.6)'
                }}
              >
                {suggestions.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => {
                      onAddPlayerTag(p.name);
                      setSearchTerm('');
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.88rem',
                      color: '#fff'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{p.name}</span>
                    <span className="badge">{p.server}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters (Dropdown Style) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={16} color="#818cf8"/> Filter Roster</span>
            {(filters.servers.length > 0 || filters.tiers.length > 0 || filters.wocOnly) && (
              <span 
                style={{ 
                  color: '#fca5a5', 
                  cursor: 'pointer', 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  padding: '4px 10px', 
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => onFiltersChange && onFiltersChange({ servers: [], tiers: [], classes: [], wocOnly: false, tierType: 'total_pow' })}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              >
                ✕ Clear All Filters
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <MultiSelectDropdown
              label="Kingdoms"
              options={['K54', 'K197', 'K116', 'K60', 'K176', 'K91', 'K170', 'K138', 'K88', 'K48']}
              selected={filters.servers}
              onToggle={(s) => toggleFilter('servers', s)}
            />
            
            <MultiSelectDropdown
              label="Tiers"
              options={['S++', 'S+', 'S', 'A', 'B', 'C', 'D']}
              selected={filters.tiers}
              onToggle={(t) => toggleFilter('tiers', t)}
            />

            <select
              value={filters.tierType}
              onChange={(e) => onFiltersChange && onFiltersChange({ ...filters, tierType: e.target.value as import('../types/stats').UnitPowType })}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#94a3b8',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="total_pow">Total Power Metric</option>
              <option value="archer_pow">Archer Power Metric</option>
              <option value="cav_pow">Cav Power Metric</option>
              <option value="siege_pow">Siege Power Metric</option>
            </select>


            <button
              onClick={() => onFiltersChange && onFiltersChange({ ...filters, wocOnly: !filters.wocOnly })}
              style={{
                background: filters.wocOnly ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                border: filters.wocOnly ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                color: filters.wocOnly ? '#fbbf24' : '#94a3b8',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: filters.wocOnly ? 600 : 400
              }}
            >
              🛡️ WOC Only
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1400px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '6px' }}>
          👈 Swipe left/right to view all 35+ Troop & Unit attributes 👉
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          width: '100%',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          backdropFilter: 'blur(12px)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxHeight: '1000px', overflowX: 'auto', overflowY: 'auto' }}>
          <table id="playerTable" style={{ width: '100%', minWidth: '3800px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#0f172a', zIndex: 10 }}>
              <tr>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Rank</th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Player
                </th>
                <th style={{ padding: '12px 10px' }}>WOC</th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('dgp')}>
                  Guard Pwr ▾
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('server')}>
                  Kingdom
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('total_pow')}>
                  Total Atk Pwr ▾
                </th>
                <th style={{ padding: '12px 10px' }}>Total Atk Tier</th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('archer_pow')}>
                  Archer Pwr
                </th>
                <th style={{ padding: '12px 10px' }}>Arc Tier</th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_pow')}>
                  Cav Pwr
                </th>
                <th style={{ padding: '12px 10px' }}>Cav Tier</th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('siege_pow')}>
                  Siege Pwr
                </th>
                <th style={{ padding: '12px 10px' }}>Sg Tier</th>

                {/* General Troop stats */}
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_atk')}>
                  Troop ATK
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_hp')}>
                  Troop HP
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_def')}>
                  Troop DEF
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_dmg')}>
                  Troop DMG
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_dmgr')}>
                  Troop DMG Recv
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_atk_bless')}>
                  Troop ATK Bless
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('troop_prot_bless')}>
                  Troop PROT Bless
                </th>

                {/* Infantry stats */}
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_atk')}>
                  Infantry ATK
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_hp')}>
                  Infantry HP
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_def')}>
                  Infantry DEF
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_dmg')}>
                  Infantry DMG
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_dmgr')}>
                  Infantry DMG Recv
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_atk_bless')}>
                  Infantry ATK Bless
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('inf_prot_bless')}>
                  Infantry PROT Bless
                </th>

                {/* Archer stats */}
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_atk')}>
                  Archer ATK
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_hp')}>
                  Archer HP
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_def')}>
                  Archer DEF
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_dmg')}>
                  Archer DMG
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_dmgr')}>
                  Archer DMG Recv
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_atk_bless')}>
                  Archer ATK Bless
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('arc_prot_bless')}>
                  Archer PROT Bless
                </th>

                {/* Cav stats */}
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_atk')}>
                  Cav ATK
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_hp')}>
                  Cav HP
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_def')}>
                  Cav DEF
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_dmg')}>
                  Cav DMG
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_dmgr')}>
                  Cav DMG Recv
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_atk_bless')}>
                  Cav ATK Bless
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('cav_prot_bless')}>
                  Cav PROT Bless
                </th>

                {/* Siege stats */}
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_atk')}>
                  Siege ATK
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_hp')}>
                  Siege HP
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_def')}>
                  Siege DEF
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_dmg')}>
                  Siege DMG
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_dmgr')}>
                  Siege DMG Recv
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_atk_bless')}>
                  Siege ATK Bless
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('sg_prot_bless')}>
                  Siege PROT Bless
                </th>
                <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('lethal')}>
                  Lethal %
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p, index) => (
                <tr key={p.name}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#94a3b8', padding: '10px 10px' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span
                      onClick={() => onOpenPlayerModal(p.name)}
                      style={{
                        cursor: 'pointer',
                        color: '#818cf8',
                        fontWeight: 600,
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#c7d2fe')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
                    >
                      {p.name} 🔍
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    {p.is_woc_leader ? <span title="Will of Caesar Leader">🛡️</span> : ''}
                  </td>
                  <td style={{ color: '#f59e0b', fontWeight: 700, padding: '10px 10px' }}>
                    {p.dgp.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span className="badge">{p.server}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#a5b4fc', padding: '10px 10px' }}>
                    {p.total_pow.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span className="tier-pill" style={{ background: p.total_pow_color }}>
                      {p.total_pow_tier}
                    </span>
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 600, padding: '10px 10px' }}>
                    {p.archer_pow.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span className="tier-pill" style={{ background: p.archer_pow_color }}>
                      {p.archer_pow_tier}
                    </span>
                  </td>
                  <td style={{ color: '#3b82f6', fontWeight: 600, padding: '10px 10px' }}>
                    {p.cav_pow.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span className="tier-pill" style={{ background: p.cav_pow_color }}>
                      {p.cav_pow_tier}
                    </span>
                  </td>
                  <td style={{ color: '#ef4444', fontWeight: 600, padding: '10px 10px' }}>
                    {p.siege_pow.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span className="tier-pill" style={{ background: p.siege_pow_color }}>
                      {p.siege_pow_tier}
                    </span>
                  </td>

                  {/* General Troop */}
                  <td style={{ padding: '10px 10px' }}>{p.troop_atk}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.troop_hp}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.troop_def}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.troop_dmg}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.troop_dmgr}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.troop_atk_bless}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.troop_prot_bless}%</td>

                  {/* Infantry */}
                  <td style={{ padding: '10px 10px' }}>{p.inf_atk}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.inf_hp}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.inf_def}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.inf_dmg}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.inf_dmgr}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.inf_atk_bless}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.inf_prot_bless}%</td>

                  {/* Archer */}
                  <td style={{ padding: '10px 10px' }}>{p.arc_atk}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.arc_hp}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.arc_def}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.arc_dmg}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.arc_dmgr}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.arc_atk_bless}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.arc_prot_bless}%</td>

                  {/* Cavalry */}
                  <td style={{ padding: '10px 10px' }}>{p.cav_atk}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.cav_hp}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.cav_def}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.cav_dmg}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.cav_dmgr}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.cav_atk_bless}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.cav_prot_bless}%</td>

                  {/* Siege */}
                  <td style={{ padding: '10px 10px' }}>{p.sg_atk}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.sg_hp}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.sg_def}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.sg_dmg}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.sg_dmgr}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.sg_atk_bless}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.sg_prot_bless}%</td>
                  <td style={{ padding: '10px 10px' }}>{p.lethal}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
