import React, { useState, useMemo } from 'react';
import { BarChart2, ArrowDownUp } from 'lucide-react';
import type { KingdomSummary, UnitPowType, Player } from '../types/stats';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface KdChartsSectionProps {
  kingdoms: KingdomSummary[];
  players: Player[];
}

export const KdChartsSection: React.FC<KdChartsSectionProps> = ({ kingdoms, players }) => {
  const [activeUnit, setActiveUnit] = useState<UnitPowType>('total_pow');
  const [activeStrengthView, setActiveStrengthView] = useState<'All' | 'Total' | 'Archer' | 'Cav' | 'Siege'>('All');
  const [sortStrongestToWeakest, setSortStrongestToWeakest] = useState<boolean>(true);
  const [activeTop10View, setActiveTop10View] = useState<'All' | 'Total' | 'Archer' | 'Cav' | 'Siege'>('All');
  const [sortTop10Strongest, setSortTop10Strongest] = useState<boolean>(true);

  const tierColors: Record<string, string> = {
    'S++': '#ef4444',
    'S+': '#f59e0b',
    'S': '#10b981',
    'A': '#06b6d4',
    'B': '#8b5cf6',
    'C': '#64748b',
    'D': '#334155'
  };

  const tierLabels = ['S++', 'S+', 'S', 'A', 'B', 'C', 'D'];

  // Calculate Top 10 averages per kingdom
  const top10Stats = useMemo(() => {
    return kingdoms.map(k => {
      const kdPlayers = players
        .filter(p => p.server === k.server)
        .sort((a, b) => b.total_pow - a.total_pow)
        .slice(0, 10);

      const count = kdPlayers.length;
      if (count === 0) {
        return {
          server: k.server,
          count: 0,
          avg_total: 0,
          avg_unit_total: 0,
          avg_archer: 0,
          avg_cav: 0,
          avg_siege: 0
        };
      }

      const avg_total = Math.round(kdPlayers.reduce((sum, p) => sum + (p.total_pow || 0), 0) / count);
      const avg_unit_total = Math.round(avg_total / 3);
      const avg_archer = Math.round(kdPlayers.reduce((sum, p) => sum + (p.archer_pow || 0), 0) / count);
      const avg_cav = Math.round(kdPlayers.reduce((sum, p) => sum + (p.cav_pow || 0), 0) / count);
      const avg_siege = Math.round(kdPlayers.reduce((sum, p) => sum + (p.siege_pow || 0), 0) / count);

      return {
        server: k.server,
        count,
        avg_total,
        avg_unit_total,
        avg_archer,
        avg_cav,
        avg_siege
      };
    });
  }, [kingdoms, players]);

  // Sorted kingdoms for Top 25 Unit Strength chart
  const sortedKingdomsForStrength = useMemo(() => {
    const list = [...kingdoms];
    if (sortStrongestToWeakest) {
      list.sort((a, b) => {
        if (activeStrengthView === 'Archer') return b.avg_archer - a.avg_archer;
        if (activeStrengthView === 'Cav') return b.avg_cav - a.avg_cav;
        if (activeStrengthView === 'Siege') return b.avg_siege - a.avg_siege;
        return Math.round(b.avg_total / 3) - Math.round(a.avg_total / 3);
      });
    }
    return list;
  }, [kingdoms, sortStrongestToWeakest, activeStrengthView]);

  const strengthServers = sortedKingdomsForStrength.map(k => k.server);

  const allStrengthDatasets = [
    {
      id: 'Total',
      label: 'Unit Atk Avg (Total/3)',
      data: sortedKingdomsForStrength.map((k) => Math.round(k.avg_total / 3)),
      backgroundColor: '#818cf8',
      borderRadius: 4
    },
    {
      id: 'Archer',
      label: 'Archer Avg',
      data: sortedKingdomsForStrength.map((k) => k.avg_archer),
      backgroundColor: '#10b981',
      borderRadius: 4
    },
    {
      id: 'Cav',
      label: 'Cav Avg',
      data: sortedKingdomsForStrength.map((k) => k.avg_cav),
      backgroundColor: '#06b6d4',
      borderRadius: 4
    },
    {
      id: 'Siege',
      label: 'Siege Avg',
      data: sortedKingdomsForStrength.map((k) => k.avg_siege),
      backgroundColor: '#f43f5e',
      borderRadius: 4
    }
  ];

  const strengthDatasets = activeStrengthView === 'All' 
    ? allStrengthDatasets 
    : allStrengthDatasets.filter(d => d.id === activeStrengthView);

  const strengthChartData = {
    labels: strengthServers,
    datasets: strengthDatasets
  };

  // Sorted kingdoms for Top 10 Unit Strength chart
  const sortedTop10Stats = useMemo(() => {
    const list = [...top10Stats];
    if (sortTop10Strongest) {
      list.sort((a, b) => {
        if (activeTop10View === 'Archer') return b.avg_archer - a.avg_archer;
        if (activeTop10View === 'Cav') return b.avg_cav - a.avg_cav;
        if (activeTop10View === 'Siege') return b.avg_siege - a.avg_siege;
        return b.avg_unit_total - a.avg_unit_total;
      });
    }
    return list;
  }, [top10Stats, sortTop10Strongest, activeTop10View]);

  const top10Servers = sortedTop10Stats.map(k => k.server);

  const allTop10Datasets = [
    {
      id: 'Total',
      label: 'Top 10 Unit Avg (Total/3)',
      data: sortedTop10Stats.map((k) => k.avg_unit_total),
      backgroundColor: '#818cf8',
      borderRadius: 4
    },
    {
      id: 'Archer',
      label: 'Top 10 Archer Avg',
      data: sortedTop10Stats.map((k) => k.avg_archer),
      backgroundColor: '#10b981',
      borderRadius: 4
    },
    {
      id: 'Cav',
      label: 'Top 10 Cav Avg',
      data: sortedTop10Stats.map((k) => k.avg_cav),
      backgroundColor: '#06b6d4',
      borderRadius: 4
    },
    {
      id: 'Siege',
      label: 'Top 10 Siege Avg',
      data: sortedTop10Stats.map((k) => k.avg_siege),
      backgroundColor: '#f43f5e',
      borderRadius: 4
    }
  ];

  const top10Datasets = activeTop10View === 'All'
    ? allTop10Datasets
    : allTop10Datasets.filter(d => d.id === activeTop10View);

  const top10ChartData = {
    labels: top10Servers,
    datasets: top10Datasets
  };

  const defaultServers = kingdoms.map((k) => k.server);

  // Stacked bar chart data for tiers (Percentage of Total Power)
  const tierDatasets = tierLabels.map((tier) => {
    return {
      label: tier,
      data: defaultServers.map((server) => {
        const kdPlayers = players.filter((p) => p.server === server);
        const totalUnitPower = kdPlayers.reduce((sum, p) => sum + ((p[activeUnit] as number) || 0), 0);
        
        if (totalUnitPower === 0) return 0;

        const tierField = `${activeUnit}_tier` as keyof Player;
        const tierPlayers = kdPlayers.filter((p) => p[tierField] === tier);
        const tierPower = tierPlayers.reduce((sum, p) => sum + ((p[activeUnit] as number) || 0), 0);

        return (tierPower / totalUnitPower) * 100;
      }),
      backgroundColor: tierColors[tier]
    };
  });

  const tierChartData = {
    labels: defaultServers,
    datasets: tierDatasets
  };

  // Whale Concentration (Top 3 vs Rest)
  const whaleData = defaultServers.map(server => {
    const kdPlayers = players.filter(p => p.server === server).sort((a, b) => b.total_pow - a.total_pow);
    const totalPower = kdPlayers.reduce((sum, p) => sum + p.total_pow, 0);
    const top3Power = kdPlayers.slice(0, 3).reduce((sum, p) => sum + p.total_pow, 0);
    
    if (totalPower === 0) return { top3: 0, rest: 0 };
    return {
      top3: (top3Power / totalPower) * 100,
      rest: ((totalPower - top3Power) / totalPower) * 100
    };
  });

  const whaleChartData = {
    labels: defaultServers,
    datasets: [
      {
        label: 'Top 3 Players (%)',
        data: whaleData.map(d => d.top3),
        backgroundColor: '#fbbf24',
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
      },
      {
        label: 'Rest of Roster (%)',
        data: whaleData.map(d => d.rest),
        backgroundColor: '#334155',
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
      }
    ]
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11, family: 'Space Grotesk' } }
      },
      tooltip: {
        backgroundColor: '#0a0f1d',
        borderColor: '#6366f1',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 10
      }
    }
  };

  const chartOptionsStacked = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
        }
      }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: 'bold' as const, family: 'Space Grotesk' } } },
      y: { stacked: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#64748b', font: { family: 'Space Grotesk' }, callback: (value: any) => `${value}%` } }
    }
  };

  const strengthOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: { ...baseOptions.plugins.tooltip, borderColor: '#06b6d4' }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: 'bold' as const, family: 'Space Grotesk' } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#64748b', font: { family: 'Space Grotesk' } } }
    }
  };

  const top10Options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: { ...baseOptions.plugins.tooltip, borderColor: '#a855f7' }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: 'bold' as const, family: 'Space Grotesk' } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#64748b', font: { family: 'Space Grotesk' } } }
    }
  };

  const whaleOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        borderColor: '#fbbf24',
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
        }
      }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: '#e2e8f0', font: { weight: 'bold' as const, family: 'Space Grotesk' } } },
      y: { stacked: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#64748b', font: { family: 'Space Grotesk' }, callback: (value: any) => `${value}%` } }
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }} className="animate-fade-in">
      <div className="section-title">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={24} color="#818cf8" /> KD Benchmarks & Graphs
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          
          {/* Chart 1 */}
          <div className="cyber-panel" style={{ padding: '20px', boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.15)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#ec4899' }}>◈</span> Tier Composition
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Space Grotesk' }}>
                  Power Contribution (%)
                </span>
              </div>
              <div className="btn-group">
                {(['total_pow', 'archer_pow', 'cav_pow', 'siege_pow'] as UnitPowType[]).map((unit) => (
                  <button key={unit} className={`btn-toggle ${activeUnit === unit ? 'active' : ''}`} onClick={() => setActiveUnit(unit)}>
                    {unit === 'total_pow' ? 'Total Atk' : unit === 'archer_pow' ? 'Archer' : unit === 'cav_pow' ? 'Cav' : 'Siege'}
                  </button>
                ))}
              </div>
            </div>
            <div className="custom-scrollbar" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}>
              <div style={{ height: '300px', minWidth: `${Math.max(kingdoms.length * 45, 400)}px`, position: 'relative' }}>
                <Bar data={tierChartData} options={chartOptionsStacked} />
              </div>
            </div>
          </div>

          {/* Chart 2: Whale Concentration */}
          <div className="cyber-panel" style={{ padding: '20px', boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(251, 191, 36, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#fbbf24' }}>◈</span> Whale Concentration
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Space Grotesk' }}>
                Top 3 vs Rest (%)
              </span>
            </div>
            <div className="custom-scrollbar" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}>
              <div style={{ height: '300px', minWidth: `${Math.max(kingdoms.length * 45, 400)}px`, position: 'relative' }}>
                <Bar data={whaleChartData} options={whaleOptions} />
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: Top 25 Unit Strength Averages */}
        <div className="cyber-panel" style={{ padding: '20px', boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#06b6d4' }}>◈</span> Top 25 Unit Strength Averages
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Space Grotesk' }}>
                {sortStrongestToWeakest ? 'Ranked from Strongest to Weakest' : 'Standard Kingdom Order'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className={`btn-toggle ${sortStrongestToWeakest ? 'active' : ''}`}
                onClick={() => setSortStrongestToWeakest(!sortStrongestToWeakest)}
                title="Toggle sorting from strongest to weakest"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 'none',
                  padding: '6px 12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  background: sortStrongestToWeakest ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(10, 15, 28, 0.85)',
                  color: sortStrongestToWeakest ? '#fff' : 'var(--text-muted)',
                  boxShadow: sortStrongestToWeakest ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                <ArrowDownUp size={13} />
                {sortStrongestToWeakest ? 'Sorted: Strongest' : 'Sort: Default'}
              </button>

              <div className="btn-group" style={{ width: 'auto', flex: 'none', margin: 0 }}>
                {(['All', 'Total', 'Archer', 'Cav', 'Siege'] as const).map((view) => (
                  <button
                    key={view}
                    className={`btn-toggle ${activeStrengthView === view ? 'active' : ''}`}
                    onClick={() => setActiveStrengthView(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="custom-scrollbar" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}>
            <div style={{ height: '320px', minWidth: `${Math.max(kingdoms.length * (activeStrengthView === 'All' ? 80 : 45), 500)}px`, position: 'relative' }}>
              <Bar data={strengthChartData} options={strengthOptions} />
            </div>
          </div>
        </div>

        {/* ROW 3: Top 10 Unit Strength Averages */}
        <div className="cyber-panel" style={{ padding: '20px', boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#a855f7' }}>◈</span> Top 10 Unit Strength Averages
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Space Grotesk' }}>
                Apex comparison of the Top 10 players of each kingdom
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className={`btn-toggle ${sortTop10Strongest ? 'active' : ''}`}
                onClick={() => setSortTop10Strongest(!sortTop10Strongest)}
                title="Toggle sorting from strongest to weakest"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 'none',
                  padding: '6px 12px',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  background: sortTop10Strongest ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(10, 15, 28, 0.85)',
                  color: sortTop10Strongest ? '#fff' : 'var(--text-muted)',
                  boxShadow: sortTop10Strongest ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
                }}
              >
                <ArrowDownUp size={13} />
                {sortTop10Strongest ? 'Sorted: Strongest' : 'Sort: Default'}
              </button>

              <div className="btn-group" style={{ width: 'auto', flex: 'none', margin: 0 }}>
                {(['All', 'Total', 'Archer', 'Cav', 'Siege'] as const).map((view) => (
                  <button
                    key={view}
                    className={`btn-toggle ${activeTop10View === view ? 'active' : ''}`}
                    onClick={() => setActiveTop10View(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="custom-scrollbar" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}>
            <div style={{ height: '320px', minWidth: `${Math.max(kingdoms.length * (activeTop10View === 'All' ? 80 : 45), 500)}px`, position: 'relative' }}>
              <Bar data={top10ChartData} options={top10Options} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
