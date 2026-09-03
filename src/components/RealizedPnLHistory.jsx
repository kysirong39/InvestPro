import React, { useState } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  CheckCircle2, 
  Tag, 
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/finance';

export const RealizedPnLHistory = ({ realizedTrades = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTradeId, setExpandedTradeId] = useState(null);

  const toggleTrade = (id) => {
    setExpandedTradeId(prev => prev === id ? null : id);
  };

  const filteredTrades = realizedTrades.filter(t => 
    t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRealizedPnL = realizedTrades.reduce((s, t) => s + (Number(t.realizedPnL) || 0), 0);
  const totalProceeds = realizedTrades.reduce((s, t) => s + (Number(t.netProceeds) || 0), 0);
  const totalBuyCost = realizedTrades.reduce((s, t) => s + (Number(t.totalBuyCost) || 0), 0);
  const winningTrades = realizedTrades.filter(t => (Number(t.realizedPnL) || 0) > 0).length;
  const winRate = realizedTrades.length > 0 ? (winningTrades / realizedTrades.length) * 100 : 0;

  return (
    <div className="space-y-5">
      
      {/* Top KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className={`glass-card rounded-2xl p-4 border ${
          totalRealizedPnL >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'
        }`}>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Tổng Lãi / Lỗ Đã Chốt
          </span>
          <div className={`text-2xl font-extrabold font-numeric ${
            totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatCurrency(totalRealizedPnL)}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Tổng Tiền Đã Thu Về (Net)
          </span>
          <div className="text-2xl font-extrabold font-numeric text-white">
            {formatCurrency(totalProceeds)}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Tổng Vốn Gốc Đã Thu Hồi
          </span>
          <div className="text-2xl font-extrabold font-numeric text-slate-300">
            {formatCurrency(totalBuyCost)}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-teal-500/30">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Tỷ Lệ Lệnh Thắng (Win Rate)
          </span>
          <div className="text-2xl font-extrabold font-numeric text-teal-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            {winRate.toFixed(0)}% <span className="text-xs text-slate-400 font-normal">({winningTrades}/{realizedTrades.length} lệnh)</span>
          </div>
        </div>

      </div>

      {/* Main Trade History Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-card">
        
        {/* Table Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Nhật Ký Các Đợt Bán Dần & Chốt Lời / Cắt Lỗ</h3>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã CP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center">#</th>
                <th className="py-3 px-3">Ngày Bán</th>
                <th className="py-3 px-3">Mã CP</th>
                <th className="py-3 px-3 text-right">Khối Lượng Bán</th>
                <th className="py-3 px-3 text-right">Giá Bán Thực Tế</th>
                <th className="py-3 px-3 text-center">Phương Pháp Lô</th>
                <th className="py-3 px-3 text-right">Tiền Thu Về (Net)</th>
                <th className="py-3 px-3 text-right">Lãi / Lỗ Đã Chốt</th>
                <th className="py-3 px-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    Chưa có lịch sử lệnh bán nào. Hãy thực hiện bán dần để ghi nhận kết quả chốt lời/cắt lỗ.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade, idx) => {
                  const isTradeProfit = trade.realizedPnL >= 0;
                  const isExpanded = expandedTradeId === trade.id;

                  return (
                    <React.Fragment key={trade.id || idx}>
                      <tr className={`hover:bg-slate-800/40 transition-colors ${isExpanded ? 'bg-slate-900/80' : ''}`}>
                        
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleTrade(trade.id)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-slate-300 font-numeric">
                          {trade.sellDate}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {trade.symbol}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-numeric font-bold text-rose-400">
                          -{formatNumber(trade.sellQty)} CP
                        </td>

                        <td className="py-3 px-3 text-right font-numeric font-bold text-slate-200">
                          {formatCurrency(trade.sellPrice)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {trade.method}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-numeric font-bold text-white">
                          {formatCurrency(trade.netProceeds)}
                        </td>

                        <td className="py-3 px-3 text-right font-numeric">
                          <span className={`font-bold text-sm ${isTradeProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(trade.realizedPnL)}
                          </span>
                          <span className={`block text-[10px] ${isTradeProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatPercent(trade.realizedPnLPct)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-400 italic max-w-xs truncate">
                          {trade.note || '—'}
                        </td>

                      </tr>

                      {/* CHI TIẾT CÁC LÔ ĐƯỢC CHỐT TRONG LỆNH NÀY */}
                      {isExpanded && trade.lotBreakdowns && trade.lotBreakdowns.length > 0 && (
                        <tr className="bg-slate-950/90 border-b border-slate-800">
                          <td colSpan="9" className="p-4">
                            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Chi tiết các lô mua vào được thanh lý trong lệnh bán này:</span>
                              </div>

                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-800 pb-1">
                                    <th className="pb-1">Lô Mua Vào</th>
                                    <th className="pb-1">Ngày Mua Gốc</th>
                                    <th className="pb-1 text-right">Giá Mua Của Lô</th>
                                    <th className="pb-1 text-right">Giá Bán Ra</th>
                                    <th className="pb-1 text-right">SL Đã Cắt</th>
                                    <th className="pb-1 text-right">Lãi / Lỗ Của Lô Này</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                  {trade.lotBreakdowns.map((lot, bIdx) => {
                                    const isLotWin = lot.realizedPnL >= 0;
                                    return (
                                      <tr key={bIdx} className="hover:bg-slate-800/20">
                                        <td className="py-2 font-semibold text-slate-300">Lô #{bIdx + 1}</td>
                                        <td className="py-2 text-slate-400">{lot.lotDate}</td>
                                        <td className="py-2 text-right font-numeric font-bold text-amber-300">
                                          {formatCurrency(lot.buyPrice)}
                                        </td>
                                        <td className="py-2 text-right font-numeric font-bold text-slate-200">
                                          {formatCurrency(trade.sellPrice)}
                                        </td>
                                        <td className="py-2 text-right font-numeric font-bold text-rose-400">
                                          {formatNumber(lot.qtySold)} CP
                                        </td>
                                        <td className="py-2 text-right font-numeric">
                                          <span className={`font-bold ${isLotWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {formatCurrency(lot.realizedPnL)} ({formatPercent(lot.realizedPnLPct)})
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
