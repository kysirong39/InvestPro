import React, { useState } from 'react';
import { X, RefreshCw, Zap, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/finance';

export const QuickPriceUpdater = ({ 
  isOpen, 
  onClose, 
  holdings = [], 
  onUpdatePrices 
}) => {
  if (!isOpen) return null;

  const [prices, setPrices] = useState(
    holdings.reduce((acc, h) => ({ ...acc, [h.id]: h.currentPrice }), {})
  );

  const handlePriceChange = (id, val) => {
    setPrices(prev => ({
      ...prev,
      [id]: Number(val) || 0
    }));
  };

  // Mô phỏng biến động ngẫu nhiên phiên thị trường (+/- 0.5% - 2.5%)
  const handleSimulateMarketTick = () => {
    const updated = {};
    holdings.forEach(h => {
      const deltaPercent = (Math.random() * 4 - 1.8); // từ -1.8% đến +2.2%
      const newP = Math.round((h.currentPrice * (1 + deltaPercent / 100)) / 100) * 100;
      updated[h.id] = newP;
    });
    setPrices(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdatePrices(prices);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cập Nhật Giá Thị Trường</h3>
              <p className="text-xs text-slate-400">Điều chỉnh giá hoặc chạy mô phỏng phiên giao dịch</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulate market button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleSimulateMarketTick}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Mô Phỏng Biến Động Phiên Khớp Lệnh (Live Tick Simulator)</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {holdings.map((holding) => {
              const currentP = prices[holding.id] || holding.currentPrice;
              const diff = currentP - holding.currentPrice;
              const diffPct = holding.currentPrice > 0 ? (diff / holding.currentPrice) * 100 : 0;

              return (
                <div key={holding.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-white">
                      {holding.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">{holding.symbol}</div>
                      <div className="text-[10px] text-slate-400">{holding.exchange}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {diff !== 0 && (
                      <span className={`text-[10px] font-bold font-numeric ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(diffPct)}
                      </span>
                    )}
                    <input
                      type="number"
                      step="100"
                      value={currentP || ''}
                      onChange={(e) => handlePriceChange(holding.id, e.target.value)}
                      className="w-28 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-right font-numeric font-bold text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" /> Áp Dụng Giá Mới
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
