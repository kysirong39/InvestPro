import React from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  MinusCircle, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  getRemainingQuantity, 
  getWeightedAvgPrice, 
  getMarketValue,
  getLotMetrics,
  getTotalCostBasis
} from '../utils/finance';

export const LotDetailsModal = ({ 
  isOpen, 
  onClose, 
  holding, 
  onOpenSellModal, 
  onOpenBuyModal 
}) => {
  if (!isOpen || !holding) return null;

  const totalRemainingQty = getRemainingQuantity(holding.lots);
  const avgPrice = getWeightedAvgPrice(holding.lots);
  const totalCost = getTotalCostBasis(holding.lots);
  const marketVal = getMarketValue(holding);
  const totalPnL = marketVal - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-400">
              {holding.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">{holding.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {holding.exchange} • {holding.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sổ theo dõi chi tiết từng lần giải ngân (Tax-Lot Breakdown & History)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Giá thị trường</span>
            <span className="text-lg font-extrabold text-white font-numeric">{formatCurrency(holding.currentPrice)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40">
            <span className="text-indigo-300 text-[10px] uppercase font-semibold block">Giá vốn bình quân (WAC)</span>
            <span className="text-lg font-extrabold text-indigo-300 font-numeric">{formatCurrency(avgPrice)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Tổng KL Đang Nắm</span>
            <span className="text-lg font-extrabold text-emerald-400 font-numeric">{formatNumber(totalRemainingQty)} CP</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            totalPnL >= 0 ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'
          }`}>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Tổng Lãi / Lỗ Tạm Tính</span>
            <div className={`text-lg font-extrabold font-numeric ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totalPnL)} ({formatPercent(totalPnLPct)})
            </div>
          </div>
        </div>

        {/* PRICE COMPARISON VISUAL BAR (So sánh giá từng lô vs Giá thị trường & Giá TB) */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              So Sánh Mức Giá Mua Các Lần Vào Lệnh (Lot Price Dispersion)
            </span>
            <span className="text-slate-400 text-[11px]">
              Đường kẻ đỏ: Giá TT ({formatCurrency(holding.currentPrice)}) | Đường xanh: Giá TB ({formatCurrency(avgPrice)})
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {holding.lots.map((lot, idx) => {
              const lotMet = getLotMetrics(lot, holding.currentPrice);
              const maxPriceRef = Math.max(holding.currentPrice, ...holding.lots.map(l => l.buyPrice)) * 1.15;
              const barWidth = `${Math.min(100, (lot.buyPrice / maxPriceRef) * 100)}%`;
              const isProfit = lotMet.pnl >= 0;

              return (
                <div key={lot.id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">Lô #{idx + 1} ({lot.date})</span>
                      <span className="text-slate-400">
                        {formatNumber(lot.remainingQty)}/{formatNumber(lot.quantity)} CP
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-numeric">
                      <span className="font-bold text-amber-300">{formatCurrency(lot.buyPrice)}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {formatPercent(lotMet.pnlPercent)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isProfit ? 'bg-gradient-to-r from-emerald-600 to-teal-400' : 'bg-gradient-to-r from-rose-600 to-pink-500'
                      }`} 
                      style={{ width: barWidth }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED LOTS TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Chi Tiết Danh Sách Từng Lô Mua
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); onOpenBuyModal(holding); }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Mua thêm lô mới
              </button>
              <button
                onClick={() => { onClose(); onOpenSellModal(holding); }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1"
              >
                <MinusCircle className="w-3.5 h-3.5" /> Bán dần
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Lô</th>
                  <th className="py-2.5 px-3">Ngày Mua</th>
                  <th className="py-2.5 px-3 text-right">Giá Mua Vào</th>
                  <th className="py-2.5 px-3 text-right">KL Ban Đầu</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400">KL Còn Lại</th>
                  <th className="py-2.5 px-3 text-right">Vốn Đang Giữ</th>
                  <th className="py-2.5 px-3 text-right">Giá Trị Hiện Tại</th>
                  <th className="py-2.5 px-3 text-right">Lãi/Lỗ Tạm Tính</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {holding.lots.map((lot, idx) => {
                  const lotMet = getLotMetrics(lot, holding.currentPrice);
                  const isSoldOut = lot.remainingQty === 0;
                  const isPartiallySold = lot.remainingQty > 0 && lot.remainingQty < lot.quantity;
                  const isLotProfit = lotMet.pnl >= 0;

                  return (
                    <tr key={lot.id || idx} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-bold text-slate-300">#{idx + 1}</td>
                      <td className="py-3 px-3 text-slate-400">{lot.date}</td>
                      <td className="py-3 px-3 text-right font-numeric font-bold text-amber-300">
                        {formatCurrency(lot.buyPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-numeric text-slate-400">
                        {formatNumber(lot.quantity)}
                      </td>
                      <td className="py-3 px-3 text-right font-numeric font-extrabold text-emerald-400">
                        {formatNumber(lot.remainingQty)}
                      </td>
                      <td className="py-3 px-3 text-right font-numeric text-slate-300">
                        {formatCurrency(lotMet.cost)}
                      </td>
                      <td className="py-3 px-3 text-right font-numeric text-slate-300">
                        {formatCurrency(lotMet.currentVal)}
                      </td>
                      <td className="py-3 px-3 text-right font-numeric">
                        <span className={`font-bold ${isLotProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(lotMet.pnl)} ({formatPercent(lotMet.pnlPercent)})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isSoldOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500">
                            Đã bán hết
                          </span>
                        ) : isPartiallySold ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Đã bán một phần
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Đang nắm giữ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenSellModal(holding, lot.id);
                          }}
                          disabled={lot.remainingQty <= 0}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold inline-flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <MinusCircle className="w-3.5 h-3.5" /> Bán Lô #{idx + 1}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
