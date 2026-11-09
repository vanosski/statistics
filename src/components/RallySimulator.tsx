import React, { useState } from 'react';
import type { Player, KingdomSummary } from '../types/stats';
import { getAllKingdomRallyResults } from '../utils/rallyOptimization';
import { Swords, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Users, Info, X, RefreshCw } from 'lucide-react';

interface RallySimulatorProps {
  kingdoms: KingdomSummary[];
  players: Player[];
}

export const RallySimulator: React.FC<RallySimulatorProps> = ({ kingdoms, players }) => {
  const [gamma, setGamma] = useState<number>(0.55);
  const [baselineMarch, setBaselineMarch] = useState<number>(150000);
  const [expandedKd, setExpandedKd] = useState<string | null>('K197');
  const [excludedPlayers, setExcludedPlayers] = useState<Set<string>>(new Set());

  const toggleExcludePlayer = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExcludedPlayers(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const clearExclusions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExcludedPlayers(new Set());
  };

  const rallyResults = getAllKingdomRallyResults(kingdoms, players, {
    baselineLeanMarch: baselineMarch,
    diminishingGamma: gamma,
    excludedPlayerNames: excludedPlayers
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 17, 34, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)'
            }}>
              <Swords size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                KvK 25-Man Rally Engine
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc' }}>
                  Live Simulation
                </span>
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Simulating a realistic 2,000,000 troop rally under 25-player cap, 380k march limits, and per-troop diminishing returns.
              </p>
            </div>
          </div>

          {/* Quick Params Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', background: 'rgba(0, 0, 0, 0.35)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Lean March Sweetspot</span>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>{Math.round(baselineMarch / 1000)}k</span>
              </div>
              <input
                type="range"
                min="100000"
                max="250000"
                step="10000"
                value={baselineMarch}
                onChange={(e) => setBaselineMarch(Number(e.target.value))}
                style={{ width: '130px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>
            <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Diminishing Curve (γ)</span>
                <span style={{ fontSize: '0.85rem', color: '#f43f5e', fontWeight: 700 }}>{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.85"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
                style={{ width: '130px', accentColor: '#f43f5e', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Explainers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <Info size={16} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span><strong>March Cap Constraint:</strong> No player can march more than 380,000 troops. Rally is hard-capped at 2,000,000 troops and 25 players.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <ShieldAlert size={16} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span><strong>The K54 / Small KD Penalty:</strong> Kingdoms with fewer players must bloat marches to 300k+ troops, dropping their per-troop kill efficiency down to ~66%.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <Sparkles size={16} color="#c084fc" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span><strong>Full WoC & Red Skill Buffs:</strong> Once the optimized troop attack punch is solved, WoC Guard (+0.85) and Red Skills are applied.</span>
          </div>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#38bdf8" />
            Rally Power Leaderboard
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click any kingdom row to view 25-man march allocations</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.4)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Rank</th>
                <th style={{ padding: '12px 16px' }}>Kingdom</th>
                <th style={{ padding: '12px 16px' }}>Players</th>
                <th style={{ padding: '12px 16px' }}>WoC Guard</th>
                <th style={{ padding: '12px 16px' }}>Red Skills</th>
                <th style={{ padding: '12px 16px' }}>Troop Efficiency</th>
                <th style={{ padding: '12px 16px' }}>Raw Rally Punch</th>
                <th style={{ padding: '12px 16px', color: '#c084fc', fontWeight: 800 }}>Final Rally Power</th>
                <th style={{ padding: '12px 16px' }}>Current Final</th>
                <th style={{ padding: '12px 16px' }}>Arc Rally</th>
                <th style={{ padding: '12px 16px' }}>Cav Rally</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {rallyResults.map((kd, idx) => {
                const isExpanded = expandedKd === kd.server;
                const shift = kd.currentFinalPower ? Math.round(kd.finalRallyPower - kd.currentFinalPower) : 0;
                const isTop3 = idx < 3;

                return (
                  <React.Fragment key={kd.server}>
                    <tr
                      onClick={() => setExpandedKd(isExpanded ? null : kd.server)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isExpanded
                          ? 'rgba(168, 85, 247, 0.12)'
                          : idx % 2 === 0
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: isTop3 ? '#facc15' : '#94a3b8' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
                        {kd.server}
                      </td>
                      <td style={{ padding: '14px 16px', color: kd.playerCount < 15 ? '#f43f5e' : '#cbd5e1' }}>
                        {kd.playerCount}
                        {kd.playerCount < 15 && <span style={{ fontSize: '0.7rem', marginLeft: '4px', color: '#f43f5e' }}>(Low)</span>}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#38bdf8', fontWeight: 600 }}>
                        {kd.guardPower ? kd.guardPower.toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: kd.redBonusPct >= 0.08 ? 'rgba(225, 29, 72, 0.25)' : 'rgba(59, 130, 246, 0.2)',
                          color: kd.redBonusPct >= 0.08 ? '#fb7185' : '#60a5fa',
                          border: `1px solid ${kd.redBonusPct >= 0.08 ? 'rgba(225, 29, 72, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}>
                          {kd.activeRedSkills} Red ({Math.round(kd.redBonusPct * 100)}%)
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '45px',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${kd.avgTroopEfficiency}%`,
                              height: '100%',
                              background: kd.avgTroopEfficiency > 85 ? '#10b981' : kd.avgTroopEfficiency > 75 ? '#f59e0b' : '#ef4444'
                            }} />
                          </div>
                          <span style={{
                            fontWeight: 700,
                            color: kd.avgTroopEfficiency > 85 ? '#34d399' : kd.avgTroopEfficiency > 75 ? '#fbbf24' : '#f87171'
                          }}>
                            {kd.avgTroopEfficiency}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#cbd5e1', fontWeight: 600 }}>
                        {kd.rawRallyPunch.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#c084fc', fontWeight: 800, fontSize: '1.05rem' }}>
                        {kd.finalRallyPower.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8' }}>
                        {kd.currentFinalPower.toLocaleString()}
                        <span style={{
                          fontSize: '0.72rem',
                          marginLeft: '6px',
                          color: shift > 0 ? '#34d399' : shift < 0 ? '#f87171' : '#94a3b8'
                        }}>
                          ({shift > 0 ? `+${shift}` : shift})
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#38bdf8' }}>
                        {kd.unitRallies.archer.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#fb923c' }}>
                        {kd.unitRallies.cav.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>

                    {/* Drill-down of the 25-man march allocation */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(10, 15, 28, 0.95)' }}>
                        <td colSpan={12} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(168, 85, 247, 0.2)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Swords size={16} color="#c084fc" />
                                {kd.server} Optimal 25-Player March Allocation (Filling 2M Cap)
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                {excludedPlayers.size > 0 && (
                                  <button
                                    onClick={clearExclusions}
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.15)',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      color: '#f87171',
                                      padding: '3px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <RefreshCw size={12} />
                                    Reset Excluded ({excludedPlayers.size})
                                  </button>
                                )}
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                  Total Troops: <strong style={{ color: '#38bdf8' }}>{(kd.totalTroopsSent / 1000000).toFixed(2)}M / 2.00M</strong>
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                              {kd.topAllocations.map((alloc, aIdx) => (
                                <div
                                  key={alloc.player.name}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    position: 'relative'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '145px' }}>
                                      #{aIdx + 1} {alloc.player.name}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {alloc.activeUnits?.map(u => (
                                          <span key={u} style={{
                                            fontSize: '0.65rem',
                                            padding: '1px 5px',
                                            borderRadius: '4px',
                                            background: u === 'Archer' ? 'rgba(56, 189, 248, 0.2)' : u === 'Cav' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                                            color: u === 'Archer' ? '#38bdf8' : u === 'Cav' ? '#fb923c' : '#c084fc',
                                            fontWeight: 700
                                          }}>
                                            {u}
                                          </span>
                                        ))}
                                      </div>
                                      <button
                                        onClick={(e) => toggleExcludePlayer(alloc.player.name, e)}
                                        title={`Exclude ${alloc.player.name} from rally`}
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.12)',
                                          border: '1px solid rgba(239, 68, 68, 0.25)',
                                          color: '#f87171',
                                          borderRadius: '6px',
                                          padding: '2px 4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    <span>Power: <strong style={{ color: '#c084fc' }}>{alloc.power.toLocaleString()}</strong></span>
                                    <span>March: <strong style={{ color: alloc.marchSize >= 380000 ? '#f43f5e' : '#38bdf8' }}>{Math.round(alloc.marchSize / 1000)}k</strong></span>
                                    <span>Eff: <strong style={{ color: alloc.troopEfficiencyPct > 85 ? '#34d399' : alloc.troopEfficiencyPct > 70 ? '#fbbf24' : '#f87171' }}>{alloc.troopEfficiencyPct}%</strong></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
