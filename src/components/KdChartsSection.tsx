import React, { useState } from 'react';
import type { KingdomSummary, UnitPowType } from '../types/stats';
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
}

export const KdChartsSection: React.FC<KdChartsSectionProps> = ({ kingdoms }) => {
  const [activeUnit, setActiveUnit] = useState<UnitPowType>('total_pow');

  const tierColors: Record<string, string> = {
    'S++': '#ef4444',
    'S+': '#f59e0b',
    'S': '#10b981',
    'A': '#3b82f6',
    'B': '#8b5cf6',
    'C': '#64748b',
    'D': '#475569'
  };

  const tierLabels = ['S++', 'S+', 'S', 'A', 'B', 'C', 'D'];
  const servers = kingdoms.map((k) => k.server);

  // Stacked bar chart data for tiers
  const tierDatasets = tierLabels.map((tier) => ({
    label: tier,
    data: kingdoms.map((k) => k.tiers[activeUnit]?.[tier as keyof typeof k.tiers[typeof activeUnit]] || 0),
    backgroundColor: tierColors[tier],
    borderRadius: 2
  }));

  const tierChartData = {
    labels: servers,
    datasets: tierDatasets
  };

  // Grouped bar chart data for unit averages
  const strengthChartData = {
    labels: servers,
    datasets: [
      {
        label: 'Total Atk Avg',
        data: kingdoms.map((k) => k.avg_total),
        backgroundColor: '#a5b4fc',
        borderRadius: 4
      },
      {
        label: 'Archer Avg',
        data: kingdoms.map((k) => k.avg_archer),
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        label: 'Cav Avg',
        data: kingdoms.map((k) => k.avg_cav),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      },
      {
        label: 'Siege Avg',
        data: kingdoms.map((k) => k.avg_siege),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#fff', font: { weight: 'bold' as const } }
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  const strengthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#fff', font: { weight: 'bold' as const } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '32px' }}>
      <div className="section-title">
        <span>📊 KD Benchmarks & Graphs</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Chart 1 */}
        <div
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            backdropFilter: 'blur(14px)',
            borderRadius: '16px',
            padding: '18px',
            boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.4)'
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>KD Player Tier Composition</h3>
            <div className="btn-group">
              {(['total_pow', 'archer_pow', 'cav_pow', 'siege_pow'] as UnitPowType[]).map((unit) => (
                <button
                  key={unit}
                  className={`btn-toggle ${activeUnit === unit ? 'active' : ''}`}
                  onClick={() => setActiveUnit(unit)}
                >
                  {unit === 'total_pow' ? 'Total Atk' : unit === 'archer_pow' ? 'Archer' : unit === 'cav_pow' ? 'Cav' : 'Siege'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={tierChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2 */}
        <div
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            backdropFilter: 'blur(14px)',
            borderRadius: '16px',
            padding: '18px',
            boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>KD Unit Strength Comparison (Avg)</h3>
          </div>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={strengthChartData} options={strengthOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
