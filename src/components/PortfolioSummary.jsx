import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  PieChart, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/finance';

export const PortfolioSummary = ({ metrics }) => {
  const {
    totalNetWorth,
    totalInvestedCost,
    totalCurrentMarketValue,
    cashBalance,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    totalRealizedPnL,
    totalTradesCount,
    winRate,
    totalDailyGainAmount,
    totalDailyGainPercent
  } = metrics;

  const isUnrealizedProfit = totalUnrealizedPnL >= 0;
  const isRealizedProfit = totalRealizedPnL >= 0;
  const isDailyProfit = totalDailyGainAmount >= 0;

  const stockRatio = totalNetWorth > 0 ? (totalCurrentMarketValue / totalNetWorth) * 100 : 0;
  const cashRatio = totalNetWorth > 0 ? (cashBalance / totalNetWorth) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* 1. TỔNG GIÁ TRỊ TÀI SẢN (NET WORTH) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden border border-slate-800 hover:border-slate-700 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Tổng Tài Sản (NAV)</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-numeric text-white tracking-tight mb-2">
          {formatCurrency(totalNetWorth)}
        </div>

        {/* Breakdown bar */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>CP: <strong className="text-slate-200">{stockRatio.toFixed(1)}%</strong></span>
            <span>Tiền: <strong className="text-amber-400">{cashRatio.toFixed(1)}%</strong></span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${stockRatio}%` }}></div>
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${cashRatio}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. TỔNG VỐN ĐẦU TƯ (COST BASIS) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden border border-slate-800 hover:border-slate-700 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Vốn Đang Nắm Giữ</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-numeric text-slate-200 tracking-tight mb-2">
          {formatCurrency(totalInvestedCost)}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span>Giá trị thị trường:</span>
          <span className="font-semibold text-slate-200 font-numeric">{formatCurrency(totalCurrentMarketValue)}</span>
        </div>
      </div>

      {/* 3. LÃI / LỖ TẠM TÍNH (UNREALIZED P&L) */}
      <div className={`glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden border transition-all group ${
        isUnrealizedProfit 
          ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-br from-emerald-950/20 to-slate-900' 
          : 'border-rose-500/30 hover:border-rose-500/50 bg-gradient-to-br from-rose-950/20 to-slate-900'
      }`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
          isUnrealizedProfit ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`}></div>

        <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Lãi / Lỗ Tạm Tính</span>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center ${
            isUnrealizedProfit 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {isUnrealizedProfit ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mb-2">
          <div className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-numeric tracking-tight ${
            isUnrealizedProfit ? 'text-emerald-400 text-glow-profit' : 'text-rose-400 text-glow-loss'
          }`}>
            {formatCurrency(totalUnrealizedPnL)}
          </div>
          <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold font-numeric rounded-md ${
            isUnrealizedProfit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {formatPercent(totalUnrealizedPnLPercent)}
          </span>
        </div>

        {/* Biến động hôm nay */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] sm:text-[11px]">
          <span className="text-slate-400">Hôm nay:</span>
          <span className={`flex items-center gap-0.5 font-semibold font-numeric ${
            isDailyProfit ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isDailyProfit ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            {formatCurrency(totalDailyGainAmount)} ({formatPercent(totalDailyGainPercent)})
          </span>
        </div>
      </div>

      {/* 4. LÃI / LỖ ĐÃ THỰC HIỆN (REALIZED P&L TỪ BÁN DẦN) */}
      <div className={`glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden border transition-all group ${
        isRealizedProfit 
          ? 'border-teal-500/30 hover:border-teal-500/50 bg-gradient-to-br from-teal-950/20 to-slate-900' 
          : 'border-orange-500/30 hover:border-orange-500/50 bg-gradient-to-br from-orange-950/20 to-slate-900'
      }`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
          isRealizedProfit ? 'bg-teal-500/10' : 'bg-orange-500/10'
        }`}></div>

        <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Lãi Đã Chốt (Bỏ Túi)</span>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center ${
            isRealizedProfit 
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
              : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <div className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-numeric tracking-tight ${
            isRealizedProfit ? 'text-teal-400' : 'text-orange-400'
          }`}>
            {formatCurrency(totalRealizedPnL)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] sm:text-[11px] text-slate-400">
          <span>Giao dịch đã chốt:</span>
          <span className="font-semibold text-slate-200 font-numeric">{totalTradesCount || 0} lượt</span>
        </div>
      </div>

    </div>
  );
};
