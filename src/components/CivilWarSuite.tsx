import React, { useState, useMemo, useEffect } from 'react';
import type { Player, KingdomSummary } from '../types/stats';
import { KINGDOM_CONFIGS } from '../utils/kingdomRanking';
import { Crosshair } from 'lucide-react';

interface CivilWarSuiteProps {
  kingdoms: KingdomSummary[];
  players: Player[];
}

export const CivilWarSuite: React.FC<CivilWarSuiteProps> = ({ kingdoms, players }) => {


  const civilWarKds = kingdoms.filter(k => KINGDOM_CONFIGS[k.server]?.isCivilWar);
  const [selectedServer, setSelectedServer] = useState<string>(civilWarKds[0]?.server || '');

  const kdPlayers = useMemo(() => {
    return players.filter(p => p.server === selectedServer).sort((a, b) => b.total_pow - a.total_pow);
  }, [players, selectedServer]);

  const [factionA, setFactionA] = useState<Set<string>>(new Set());
  const [factionB, setFactionB] = useState<Set<string>>(new Set());
  const [mobileActiveTeam, setMobileActiveTeam] = useState<'A' | 'B'>('A');

  useEffect(() => {
    if (kdPlayers.length === 0) return;

    const tagCounts: Record<string, number> = {};
    kdPlayers.forEach(p => {
      const match = p.name.match(/^\((.*?)\)/);
      if (match) {
        const tag = match[1];
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });

    const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    const tagA = sortedTags[0] || 'A';
    const tagB = sortedTags[1] || 'B';

    const nextA = new Set<string>();
    const nextB = new Set<string>();

    if (Object.keys(tagCounts).length === 0) {
      // Kingdoms with no tags (like K91): alternate draft sorted by power
      kdPlayers.forEach((p, idx) => {
        if (idx % 2 === 0) nextA.add(p.name);
        else nextB.add(p.name);
      });
    } else {
      // Kingdoms with tags: place into their respective alliance team, unaligned split evenly
      kdPlayers.forEach(p => {
        const match = p.name.match(/^\((.*?)\)/);
        const tag = match ? match[1] : null;

        if (tag === tagA) {
          nextA.add(p.name);
        } else if (tag === tagB) {
          nextB.add(p.name);
        } else {
          if (nextA.size <= nextB.size) nextA.add(p.name);
          else nextB.add(p.name);
        }
      });
    }

    setFactionA(nextA);
    setFactionB(nextB);
  }, [kdPlayers, selectedServer]);

  const toggleA = (name: string) => {
    const next = new Set(factionA);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setFactionA(next);
  };

  const toggleB = (name: string) => {
    const next = new Set(factionB);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setFactionB(next);
  };

  const computeStats = (factionSet: Set<string>) => {
    const roster = kdPlayers.filter(p => factionSet.has(p.name)).slice(0, 25);
    if (roster.length === 0) return null;

    let woc = roster[0];
    let maxDgp = woc.dgp;
    let sumTotal = 0, sumArc = 0, sumCav = 0, sumSg = 0;

    roster.forEach(p => {
      if (p.dgp > maxDgp) { maxDgp = p.dgp; woc = p; }
      sumTotal += p.total_pow; sumArc += p.archer_pow; sumCav += p.cav_pow; sumSg += p.siege_pow;
    });

    const count = roster.length;
    const avgTotal = Math.round(sumTotal / count);
    
    const conf = KINGDOM_CONFIGS[selectedServer] || ({ redSkills: 1 } as typeof KINGDOM_CONFIGS[string]);
    
    let activeRedSkills = conf.redSkills;
    if (selectedServer === 'K27' && woc) {
      if (woc.name.includes('X-')) {
        activeRedSkills = 4;
      } else if (woc.name.toLowerCase().includes('avenok')) {
        activeRedSkills = 1;
      }
    }
    
    const redBonus = conf.customBuff !== undefined ? conf.customBuff : (activeRedSkills > 0 ? 0.04 + (activeRedSkills - 1) * 0.01 : 0);
    const finalPower = Math.round((avgTotal + (maxDgp * 0.85)) * (1 + redBonus));

    return {
      count, woc, maxDgp, avgTotal, finalPower, redBonusPct: Math.round(redBonus * 100),
      avgArc: Math.round(sumArc / count), avgCav: Math.round(sumCav / count), avgSg: Math.round(sumSg / count)
    };
  };

  const statsA = useMemo(() => computeStats(factionA), [factionA, kdPlayers, selectedServer]);
  const statsB = useMemo(() => computeStats(factionB), [factionB, kdPlayers, selectedServer]);



  return (
    <div className="animate-fade-in" style={{ padding: '0', maxWidth: '1600px', margin: '0 auto', color: '#f1f5f9' }}>
      
      {/* Massive Cyberpunk Header (Removed) */}

      <div className="civil-war-container">
        {civilWarKds.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No kingdoms currently flagged for Civil War.</div>
        ) : (
          <>
            {/* Target KD Selector */}
            <div className="civil-war-target-selector">
              <div className="civil-war-target-box">
                <Crosshair size={20} color="#00d2ff" style={{ flexShrink: 0 }} />
                <span className="civil-war-target-label">Select Target:</span>
                <select 
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="civil-war-select"
                >
                  {civilWarKds.map(k => <option key={k.server} value={k.server}>{k.server}</option>)}
                </select>
              </div>
            </div>

            {/* Cyberpunk Versus Header */}
            <div className="civil-war-versus-header">
              {/* Faction A Power */}
              <div className="faction-power-col faction-a">
                <div className="faction-title-a">Faction A Power</div>
                <div className="faction-power-val faction-val-a">{statsA?.finalPower.toLocaleString() || 0}</div>
                <div className="faction-woc">WOC: <strong style={{ color: '#00d2ff', wordBreak: 'break-word' }}>{statsA?.woc?.name || '-'}</strong></div>
              </div>

              {/* Glitch VS Animation */}
              <div className="glitch-vs-box">
                <div 
                  className="glitch"
                  data-text="VS"
                >
                  VS
                </div>
              </div>

              {/* Faction B Power */}
              <div className="faction-power-col faction-b">
                <div className="faction-title-b">Faction B Power</div>
                <div className="faction-power-val faction-val-b">{statsB?.finalPower.toLocaleString() || 0}</div>
                <div className="faction-woc">WOC: <strong style={{ color: '#ff0055', wordBreak: 'break-word' }}>{statsB?.woc?.name || '-'}</strong></div>
              </div>
            </div>

            {/* Mobile Tab Switcher Slider */}
            <div className="civil-war-mobile-switcher">
              <button 
                className={`cw-mobile-tab-btn ${mobileActiveTeam === 'A' ? 'active-a' : ''}`}
                onClick={() => setMobileActiveTeam('A')}
              >
                TEAM A ({statsA?.count || 0}/25)
              </button>
              <button 
                className={`cw-mobile-tab-btn ${mobileActiveTeam === 'B' ? 'active-b' : ''}`}
                onClick={() => setMobileActiveTeam('B')}
              >
                TEAM B ({statsB?.count || 0}/25)
              </button>
            </div>

            {/* Side-by-Side Tables (Sliding/Switchable on Mobile) */}
            <div className="civil-war-tables-grid">
              
              {/* FACTION A TABLE */}
              <div className={`faction-table-card faction-table-a ${mobileActiveTeam === 'A' ? 'mobile-visible' : 'mobile-hidden'}`}>
                <h3 className="cw-table-heading cw-heading-a">TEAM A ({statsA?.count || 0}/25)</h3>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '280px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '8px', color: '#94a3b8', fontSize: '0.8rem', width: '40px' }}>Inc</th>
                        <th style={{ padding: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>Player</th>
                        <th style={{ padding: '8px', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right' }}>Total Power</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kdPlayers.map(p => {
                        const isSelected = factionA.has(p.name);
                        return (
                          <tr key={p.name} onClick={() => toggleA(p.name)} style={{ cursor: 'pointer', background: isSelected ? 'rgba(0, 210, 255, 0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                            <td style={{ padding: '8px' }}>
                              <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer', accentColor: '#00d2ff' }} />
                            </td>
                            <td style={{ padding: '8px', color: isSelected ? '#fff' : '#64748b', fontSize: '0.88rem', fontWeight: 600, wordBreak: 'break-word' }}>{p.name}</td>
                            <td style={{ padding: '8px', color: isSelected ? '#cbd5e1' : '#475569', fontFamily: 'monospace', fontSize: '0.88rem', textAlign: 'right' }}>{p.total_pow.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FACTION B TABLE */}
              <div className={`faction-table-card faction-table-b ${mobileActiveTeam === 'B' ? 'mobile-visible' : 'mobile-hidden'}`}>
                <h3 className="cw-table-heading cw-heading-b">TEAM B ({statsB?.count || 0}/25)</h3>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '280px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '8px', color: '#94a3b8', fontSize: '0.8rem', width: '40px' }}>Inc</th>
                        <th style={{ padding: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>Player</th>
                        <th style={{ padding: '8px', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right' }}>Total Power</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kdPlayers.map(p => {
                        const isSelected = factionB.has(p.name);
                        return (
                          <tr key={p.name} onClick={() => toggleB(p.name)} style={{ cursor: 'pointer', background: isSelected ? 'rgba(255, 0, 85, 0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                            <td style={{ padding: '8px' }}>
                              <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer', accentColor: '#ff0055' }} />
                            </td>
                            <td style={{ padding: '8px', color: isSelected ? '#fff' : '#64748b', fontSize: '0.88rem', fontWeight: 600, wordBreak: 'break-word' }}>{p.name}</td>
                            <td style={{ padding: '8px', color: isSelected ? '#cbd5e1' : '#475569', fontFamily: 'monospace', fontSize: '0.88rem', textAlign: 'right' }}>{p.total_pow.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};
