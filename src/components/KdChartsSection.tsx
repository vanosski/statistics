import React, { useState } from 'react';
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
  const servers = kingdoms.map((k) => k.server);

  // Stacked bar chart data for tiers (Percentage of Total Power)
  const tierDatasets = tierLabels.map((tier) => {
    return {
      label: tier,
      data: servers.map((server) => {
        const kdPlayers = players.filter((p) => p.server === server);
        // Safely access the power value dynamically
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
    labels: servers,
    datasets: tierDatasets
  };

  // Grouped bar chart data for unit averages
  const allStrengthDatasets = [
    {
      id: 'Total',
      label: 'Total Atk Avg',
      data: kingdoms.map((k) => k.avg_total),
      backgroundColor: '#818cf8',
      borderRadius: 4
    },
    {
      id: 'Archer',
      label: 'Archer Avg',
      data: kingdoms.map((k) => k.avg_archer),
      backgroundColor: '#10b981',
      borderRadius: 4
    },
    {
      id: 'Cav',
      label: 'Cav Avg',
      data: kingdoms.map((k) => k.avg_cav),
      backgroundColor: '#06b6d4',
      borderRadius: 4
    },
    {
      id: 'Siege',
      label: 'Siege Avg',
      data: kingdoms.map((k) => k.avg_siege),
      backgroundColor: '#f43f5e',
      borderRadius: 4
    }
  ];

  const strengthDatasets = activeStrengthView === 'All' 
    ? allStrengthDatasets 
    : allStrengthDatasets.filter(d => d.id === activeStrengthView);

  const strengthChartData = {
    labels: servers,
    datasets: strengthDatasets
  };

  // Whale Concentration (Top 3 vs Rest)
  const whaleData = servers.map(server => {
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
    labels: servers,
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
        <span>📊 KD Benchmarks & Graphs</span>
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
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar data={tierChartData} options={chartOptionsStacked} />
            </div>
          </div>

          {/* Chart 3: Whale Concentration */}
          <div className="cyber-panel" style={{ padding: '20px', boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(251, 191, 36, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#fbbf24' }}>◈</span> Whale Concentration
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Space Grotesk' }}>
                Top 3 vs Rest (%)
              </span>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar data={whaleChartData} options={whaleOptions} />
            </div>
          </div>

        </div>

        {/* ROW 2 */}
        <div className="cyber-panel" style={{ padding: '20px', boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#06b6d4' }}>◈</span> Unit Strength Averages
            </h3>
            
            <div className="btn-group">
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
          <div style={{ height: '320px', position: 'relative' }}>
            <Bar data={strengthChartData} options={strengthOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};
