import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  Wallet, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  RefreshCcw
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

export const ResetPortfolioModal = ({ 
  isOpen, 
  onClose, 
  currentCash = 0,
  holdingsCount = 0,
  tradesCount = 0,
  onConfirmClearAll,
  onResetSampleData 
}) => {
  // Mặc định đặt tiền mặt ban đầu là 0 VNĐ để xóa sạch hoàn toàn
  const [initialCash, setInitialCash] = useState(0);
  const [clearHistory, setClearHistory] = useState(true);

  if (!isOpen) return null;

  const handleClear = (e) => {
    e.preventDefault();
    onConfirmClearAll({
      initialCash: Number(initialCash) || 0,
      clearHistory
    });
    onClose();
  };

  const handleSample = () => {
    onResetSampleData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Xóa Toàn Bộ & Thiết Lập Danh Mục Mới</h3>
              <p className="text-xs text-slate-400">Xóa sạch toàn bộ cổ phiếu và thiết lập lại số dư tiền mặt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Badge */}
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5 mb-5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong>Xác nhận xóa:</strong> Thao tác này sẽ xóa sạch toàn bộ <strong>{holdingsCount} mã cổ phiếu</strong> và các đợt mua vào hiện tại để bạn nhập danh mục thực tế của mình từ đầu.
          </div>
        </div>

        <form onSubmit={handleClear} className="space-y-4">
          
          {/* Initial Cash Balance input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Số Dư Tiền Mặt Sau Khi Xóa (VNĐ):
              </label>
              <span className="text-xs font-extrabold text-amber-400 font-numeric">
                {formatCurrency(Number(initialCash) || 0)}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000000"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-base font-numeric font-extrabold text-amber-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setInitialCash(0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  initialCash === 0 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                0 ₫ (Xóa Sạch Tiền)
              </button>

              {currentCash > 0 && (
                <button
                  type="button"
                  onClick={() => setInitialCash(currentCash)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-amber-300 hover:border-amber-500/50 font-numeric"
                >
                  Giữ tiền cũ ({formatCurrency(currentCash, 'VND', true)})
                </button>
              )}

              {[50000000, 100000000, 200000000, 500000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInitialCash(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-numeric transition-all ${
                    initialCash === val 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {formatCurrency(val, 'VND', true)}
                </button>
              ))}
            </div>
          </div>

          {/* Option: Clear Realized Trades History */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200 block">Xóa cả lịch sử bán & lãi đã chốt cũ</span>
              <span className="text-[11px] text-slate-500">Đặt lại tỷ lệ thắng (Win rate) và tổng lãi/lỗ đã chốt về 0</span>
            </div>
            <input
              type="checkbox"
              checked={clearHistory}
              onChange={(e) => setClearHistory(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-98 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xác Nhận Xóa Hết (Tiền mặt = {formatCurrency(Number(initialCash) || 0)})</span>
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleSample}
                className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục dữ liệu mẫu
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
