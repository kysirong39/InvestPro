import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Save, 
  Sliders, 
  Edit3, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatNumber, getWeightedAvgPrice, getRemainingQuantity } from '../utils/finance';

export const QuickPriceUpdaterModal = ({ 
  isOpen, 
  onClose, 
  holdings = [], 
  onSaveBatchPrices 
}) => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (holdings && holdings.length > 0) {
      const initial = {};
      holdings.forEach(h => {
        initial[h.id] = h.currentPrice;
      });
      setPrices(initial);
    }
  }, [holdings, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (id, val) => {
    setPrices(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUpdated = {};
    Object.keys(prices).forEach(id => {
      const num = Number(prices[id]);
      if (!isNaN(num) && num > 0) {
        cleanUpdated[id] = num;
      }
    });

    onSaveBatchPrices(cleanUpdated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Sửa Nhanh Bảng Giá Thị Trường Toàn Bộ Danh Mục
              </h3>
              <p className="text-xs text-slate-400">
                Gõ nhanh giá hôm nay cho tất cả các mã cùng một lúc
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-bold bg-slate-950/80 sticky top-0">
                  <th className="py-2.5 px-3">Mã Cổ Phiếu</th>
                  <th className="py-2.5 px-3 text-right">Khối Lượng</th>
                  <th className="py-2.5 px-3 text-right text-indigo-300">Giá Vốn TB (WAC)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-300 font-bold min-w-[160px]">
                    Giá Thị Trường Hôm Nay (VNĐ) *
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {holdings.map(h => {
                  const qty = getRemainingQuantity(h.lots);
                  const avgPrice = getWeightedAvgPrice(h.lots);
                  const curVal = prices[h.id] !== undefined ? prices[h.id] : h.currentPrice;

                  return (
                    <tr key={h.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white font-mono text-sm">{h.symbol}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[130px]">{h.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-numeric text-slate-300 font-bold">
                        {formatNumber(qty)}
                      </td>

                      <td className="py-3 px-3 text-right font-numeric text-indigo-300 font-bold">
                        {formatCurrency(avgPrice)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            min="100"
                            step="100"
                            value={curVal || ''}
                            onChange={(e) => handlePriceChange(h.id, e.target.value)}
                            className="w-32 px-2.5 py-1.5 bg-slate-950 border border-emerald-500/60 focus:border-emerald-400 rounded-xl text-right font-numeric font-extrabold text-emerald-300 text-sm focus:outline-none"
                            placeholder="Nhập giá..."
                            required
                          />
                          <span className="text-slate-400 font-bold">₫</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Toàn Bộ Giá</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
