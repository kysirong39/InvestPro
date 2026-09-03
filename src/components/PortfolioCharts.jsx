import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart, BarChart3, Layers, TrendingUp } from 'lucide-react';
import { 
  formatCurrency, 
  formatPercent, 
  getMarketValue, 
  getUnrealizedPnL, 
  getRemainingQuantity 
} from '../utils/finance';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export const PortfolioCharts = ({ holdings = [], cashBalance = 0 }) => {
  const [allocationType, setAllocationType] = useState('symbol'); // 'symbol' | 'sector'

  const activeHoldings = holdings.filter(h => getRemainingQuantity(h.lots) > 0);

  // 1. Phân bổ theo Từng Mã Cổ Phiếu + Tiền mặt
  const symbolLabels = [...activeHoldings.map(h => h.symbol), 'Tiền Mặt'];
  const symbolValues = [...activeHoldings.map(h => getMarketValue(h)), cashBalance];
  
  const colors = [
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#14b8a6', // Teal
    '#64748b'  // Cash
  ];

  const doughnutData = {
    labels: symbolLabels,
    datasets: [
      {
        data: symbolValues,
        backgroundColor: colors.slice(0, symbolLabels.length),
        borderColor: '#0a0e17',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          padding: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  // 2. Biểu đồ Lãi / Lỗ Từng Mã (Bar Chart)
  const barLabels = activeHoldings.map(h => h.symbol);
  const barPnLValues = activeHoldings.map(h => getUnrealizedPnL(h).pnl);
  const barColors = barPnLValues.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)');

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Lãi/Lỗ Tạm Tính (VNĐ)',
        data: barPnLValues,
        backgroundColor: barColors,
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const h = activeHoldings[context.dataIndex];
            const pnl = context.parsed.y;
            const pct = getUnrealizedPnL(h).pnlPercent;
            return ` Lãi/Lỗ: ${formatCurrency(pnl)} (${formatPercent(pct)})`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: {
          color: '#94a3b8',
          callback: function (val) {
            return formatCurrency(val, 'VND', true);
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* Doughnut Chart: Phân bổ tài sản */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">Tỷ Trọng Phân Bổ Danh Mục</h4>
          </div>
        </div>

        <div className="h-64 relative flex items-center justify-center">
          {symbolValues.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="text-slate-500 text-xs">Chưa có dữ liệu phân bổ.</div>
          )}
        </div>
      </div>

      {/* Bar Chart: Lãi / Lỗ theo mã */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-sm text-white">Hiệu Suất Lãi / Lỗ Từng Mã CP</h4>
          </div>
        </div>

        <div className="h-64">
          {barLabels.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Chưa có dữ liệu cổ phiếu đang nắm giữ.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
