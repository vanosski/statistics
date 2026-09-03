import React, { useState, useMemo, useEffect } from 'react';
import type { Player, KingdomSummary } from '../types/stats';
import { KINGDOM_CONFIGS } from '../utils/kingdomRanking';
import { Lock, Crosshair } from 'lucide-react';

interface CivilWarSuiteProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  isApproved: boolean;
}

export const CivilWarSuite: React.FC<CivilWarSuiteProps> = ({ kingdoms, players, isApproved }) => {


  const civilWarKds = kingdoms.filter(k => KINGDOM_CONFIGS[k.server]?.isCivilWar);
  const [selectedServer, setSelectedServer] = useState<string>(civilWarKds[0]?.server || '');

  const kdPlayers = useMemo(() => {
    return players.filter(p => p.server === selectedServer).sort((a, b) => b.total_pow - a.total_pow);
  }, [players, selectedServer]);

  const [factionA, setFactionA] = useState<Set<string>>(new Set());
  const [factionB, setFactionB] = useState<Set<string>>(new Set());

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

    const wocLeader = kdPlayers.reduce((prev, curr) => (curr.dgp > prev.dgp ? curr : prev), kdPlayers[0]);

    const nextA = new Set<string>();
    const nextB = new Set<string>();

    kdPlayers.forEach(p => {
      const match = p.name.match(/^\((.*?)\)/);
      const tag = match ? match[1] : null;

      if (p.name === wocLeader.name) {
        nextA.add(p.name);
        nextB.add(p.name);
      } else if (tag === tagA) {
        nextA.add(p.name);
      } else if (tag === tagB) {
        nextB.add(p.name);
      } else {
        if (nextA.size <= nextB.size) nextA.add(p.name);
        else nextB.add(p.name);
      }
    });

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
    
    const conf = KINGDOM_CONFIGS[selectedServer] || { redSkills: 0 };
    const redBonus = conf.customBuff !== undefined ? conf.customBuff : (conf.redSkills > 0 ? 0.04 + (conf.redSkills - 1) * 0.01 : 0);
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

      <div style={{ padding: '40px' }}>
        {civilWarKds.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No kingdoms currently flagged for Civil War.</div>
        ) : (
          <>
            {/* Target KD Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: '#09090b', border: '1px solid #27272a', padding: '10px 20px', borderRadius: '4px', boxShadow: '0 0 20px rgba(0,210,255,0.1)' }}>
                <Crosshair size={20} color="#00d2ff" style={{ marginRight: '15px' }} />
                <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', marginRight: '20px' }}>Select Target:</span>
                <select 
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  style={{ background: 'transparent', color: '#00d2ff', border: 'none', outline: 'none', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Space Grotesk', cursor: 'pointer', textShadow: '0 0 10px rgba(0,210,255,0.5)' }}
                >
                  {civilWarKds.map(k => <option key={k.server} value={k.server}>{k.server}</option>)}
                </select>
              </div>
            </div>

          {/* Cyberpunk Versus Header */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', marginBottom: '40px' }}>
            
            {/* Faction A Power */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 800, textShadow: '0 0 10px rgba(0,210,255,0.8)' }}>Faction A Power</div>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#fff', fontFamily: 'Space Grotesk', lineHeight: 1, textShadow: '0 0 20px rgba(0,210,255,0.8)' }}>{statsA?.finalPower.toLocaleString() || 0}</div>
              <div style={{ fontSize: '1rem', color: '#cbd5e1', marginTop: '10px' }}>WOC: <strong style={{ color: '#00d2ff' }}>{statsA?.woc?.name || '-'}</strong></div>
            </div>

            {/* Glitch VS Animation */}
            <div style={{
              width: '100px', height: '100px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10
            }}>
              <div 
                className="glitch"
                data-text="VS"
                style={{ fontSize: '4rem', zIndex: 11 }}
              >
                VS
              </div>
            </div>

            {/* Faction B Power */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', color: '#ff0055', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 800, textShadow: '0 0 10px rgba(255,0,85,0.8)' }}>Faction B Power</div>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#fff', fontFamily: 'Space Grotesk', lineHeight: 1, textShadow: '0 0 20px rgba(255,0,85,0.8)' }}>{statsB?.finalPower.toLocaleString() || 0}</div>
              <div style={{ fontSize: '1rem', color: '#cbd5e1', marginTop: '10px' }}>WOC: <strong style={{ color: '#ff0055' }}>{statsB?.woc?.name || '-'}</strong></div>
            </div>
          </div>

          {/* Side-by-Side Tables */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            
            {/* FACTION A TABLE */}
            <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(0, 210, 255, 0.3)', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#00d2ff', textAlign: 'center', letterSpacing: '2px' }}>TEAM A ({statsA?.count || 0}/25)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Include</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Player</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Total Power</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kdPlayers.map(p => {
                      const isSelected = factionA.has(p.name);
                      return (
                        <tr key={p.name} onClick={() => toggleA(p.name)} style={{ cursor: 'pointer', background: isSelected ? 'rgba(0, 210, 255, 0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '10px' }}>
                            <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer', accentColor: '#00d2ff' }} />
                          </td>
                          <td style={{ padding: '10px', color: isSelected ? '#fff' : '#64748b' }}>{p.name}</td>
                          <td style={{ padding: '10px', color: isSelected ? '#cbd5e1' : '#475569', fontFamily: 'monospace' }}>{p.total_pow.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FACTION B TABLE */}
            <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 0, 85, 0.3)', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#ff0055', textAlign: 'center', letterSpacing: '2px' }}>TEAM B ({statsB?.count || 0}/25)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Include</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Player</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Total Power</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kdPlayers.map(p => {
                      const isSelected = factionB.has(p.name);
                      return (
                        <tr key={p.name} onClick={() => toggleB(p.name)} style={{ cursor: 'pointer', background: isSelected ? 'rgba(255, 0, 85, 0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '10px' }}>
                            <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer', accentColor: '#ff0055' }} />
                          </td>
                          <td style={{ padding: '10px', color: isSelected ? '#fff' : '#64748b' }}>{p.name}</td>
                          <td style={{ padding: '10px', color: isSelected ? '#cbd5e1' : '#475569', fontFamily: 'monospace' }}>{p.total_pow.toLocaleString()}</td>
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
