import React, { useState, useMemo } from 'react';
import type { Player, KingdomSummary } from '../types/stats';
import { getRankedKingdoms } from '../utils/kingdomRanking';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Lock, Calculator, Users, Flame, Shield, Swords, Crosshair } from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface KingdomSimulatorProps {
  kingdoms: KingdomSummary[];
  players: Player[];
  isApproved: boolean;
}

export const KingdomSimulator: React.FC<KingdomSimulatorProps> = ({ kingdoms, players, isApproved }) => {
  // If not approved, show lock screen
  if (!isApproved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: '#f1f5f9' }}>
        <Lock size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Access Denied</h2>
        <p style={{ color: '#94a3b8' }}>You must be logged in and approved to use the Kingdom Rally Simulator.</p>
      </div>
    );
  }

  // Selected Kingdom State
  const [selectedServer, setSelectedServer] = useState<string>(kingdoms[0]?.server || '');
  
  // Players in that Kingdom
  const kdPlayers = useMemo(() => {
    return players.filter(p => p.server === selectedServer).sort((a, b) => b.total_pow - a.total_pow);
  }, [players, selectedServer]);

  // Selected Players (default all)
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<Set<string>>(new Set());

  // Initialize selected players when kingdom changes
  React.useEffect(() => {
    const top25 = kdPlayers.slice(0, 25);
    const initialSelection = new Set(top25.map(p => p.name));
    
    const woc = kdPlayers.find(p => p.is_woc_leader);
    if (woc) {
      initialSelection.add(woc.name);
    }
    
    setSelectedPlayerNames(initialSelection);
  }, [kdPlayers]);

  const togglePlayer = (name: string) => {
    const next = new Set(selectedPlayerNames);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedPlayerNames(next);
  };

  const selectAll = () => setSelectedPlayerNames(new Set(kdPlayers.map(p => p.name)));
  const deselectAll = () => setSelectedPlayerNames(new Set());

  // Dynamic Calculations
  const activePlayers = kdPlayers.filter(p => selectedPlayerNames.has(p.name));
  
  const stats = useMemo(() => {
    if (activePlayers.length === 0) return null;

    let wocLeader = activePlayers[0];
    let maxDgp = wocLeader.dgp;

    let totalPow = 0;
    let archerPow = 0;
    let cavPow = 0;
    let siegePow = 0;
    
    // Combat stats
    let totalAtk = 0;
    let totalHp = 0;
    let totalDef = 0;
    let totalLethal = 0;
    let totalDmg = 0;

    activePlayers.forEach(p => {
      if (p.dgp > maxDgp) {
        maxDgp = p.dgp;
        wocLeader = p;
      }
      totalPow += p.total_pow;
      archerPow += p.archer_pow;
      cavPow += p.cav_pow;
      siegePow += p.siege_pow;
      
      // We assume detailed stats exist if isApproved
      totalAtk += (p.troop_atk || 0);
      totalHp += (p.troop_hp || 0);
      totalDef += (p.troop_def || 0);
      totalLethal += (p.lethal || 0);
      totalDmg += (p.troop_dmg || 0);
    });

    const count = activePlayers.length;
    const avgTotal = Math.round(totalPow / count);
    
    // Base kingdom config
    const baseKd = kingdoms.find(k => k.server === selectedServer);
    const rankedBase = baseKd ? getRankedKingdoms([baseKd], players)[0] : null;
    const redBonus = rankedBase?.redBonus || 0;
    const redSkills = rankedBase?.config.redSkills || 0;
    
    // Formula: Math.round((avg_total + (guardPower * 0.85)) * (1 + redBonus))
    const finalPower = Math.round((avgTotal + (maxDgp * 0.85)) * (1 + redBonus));

    return {
      count,
      wocLeader,
      avgTotal,
      avgArcher: Math.round(archerPow / count),
      avgCav: Math.round(cavPow / count),
      avgSiege: Math.round(siegePow / count),
      avgAtk: (totalAtk / count).toFixed(1),
      avgHp: (totalHp / count).toFixed(1),
      avgDef: (totalDef / count).toFixed(1),
      avgLethal: (totalLethal / count).toFixed(2),
      avgDmg: (totalDmg / count).toFixed(1),
      maxDgp,
      finalPower,
      redSkills,
      redBonusPct: Math.round(redBonus * 100)
    };
  }, [activePlayers, selectedServer, kingdoms, players]);

  const radarData = stats ? {
    labels: ['Archer', 'Cavalry', 'Siege'],
    datasets: [
      {
        label: 'Avg Unit Power',
        data: [stats.avgArcher, stats.avgCav, stats.avgSiege],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      }
    ],
  } : null;

  const combatRadarData = stats ? {
    labels: ['ATK', 'HP', 'DEF', 'DMG'],
    datasets: [
      {
        label: 'Avg Troop Stats (%)',
        data: [Number(stats.avgAtk), Number(stats.avgHp), Number(stats.avgDef), Number(stats.avgDmg)],
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
      }
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#cbd5e1', font: { size: 11, family: 'Space Grotesk' } },
        ticks: { display: false, stepSize: 200 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      <div className="section-title">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calculator size={24} color="#6366f1" /> Kingdom Rally Simulator
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Dynamically simulate your Kingdom's power by toggling players in and out of the roster.
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
        
        {/* Left Panel: Roster Selection */}
        <div style={{ flex: '1 1 350px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
              <Users size={18} /> Roster Selection
            </h3>
            <select 
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', outline: 'none' }}
            >
              {kingdoms.map(k => (
                <option key={k.server} value={k.server}>{k.server}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button onClick={selectAll} style={{ flex: 1, padding: '6px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Select All</button>
            <button onClick={deselectAll} style={{ flex: 1, padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Deselect All</button>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {kdPlayers.map(p => (
              <label key={p.name} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: selectedPlayerNames.has(p.name) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', border: selectedPlayerNames.has(p.name) ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent', transition: 'all 0.2s' }}>
                <input 
                  type="checkbox" 
                  checked={selectedPlayerNames.has(p.name)} 
                  onChange={() => togglePlayer(p.name)} 
                  style={{ marginRight: '12px', width: '18px', height: '18px', accentColor: '#6366f1' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: selectedPlayerNames.has(p.name) ? '#fff' : '#cbd5e1' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total: {p.total_pow.toLocaleString()} | DGP: {p.dgp.toLocaleString()}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Right Panel: Analytics */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Simulated Rally Power</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk' }}>{stats?.finalPower.toLocaleString() || '0'}</div>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}><Flame size={12}/> +{stats?.redBonusPct || 0}% Red Buff</div>
            </div>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>WOC Guard Leader</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: '4px', wordBreak: 'break-all' }}>{stats?.wocLeader?.name || '-'}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}><Shield size={12}/> {stats?.maxDgp.toLocaleString() || 0} DGP</div>
            </div>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Avg Player Power</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'Space Grotesk' }}>{stats?.avgTotal.toLocaleString() || '0'}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{stats?.count || 0} Players Selected</div>
            </div>
          </div>

          {/* Radar Charts */}
          {stats && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', flex: 1 }}>
              <div style={{ flex: '1 1 250px', background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#cbd5e1' }}><Swords size={16} color="#6366f1"/> Unit Specialization</h4>
                <div style={{ height: '220px', position: 'relative' }}>
                  {radarData && <Radar data={radarData} options={chartOptions} />}
                </div>
              </div>
              
              <div style={{ flex: '1 1 250px', background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#cbd5e1' }}><Crosshair size={16} color="#ef4444"/> Core Combat Stats</h4>
                <div style={{ height: '220px', position: 'relative' }}>
                  {combatRadarData && <Radar data={combatRadarData} options={chartOptions} />}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#f59e0b', marginTop: '16px', fontWeight: 600 }}>
                  Avg Lethal Rate: {stats.avgLethal}%
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
