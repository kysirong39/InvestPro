import React, { useState } from 'react';
import { X, Wallet, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/finance';

export const CashFlowModal = ({ isOpen, onClose, currentCash, onUpdateCash }) => {
  const [type, setType] = useState('DEPOSIT'); // 'DEPOSIT' | 'WITHDRAW'
  const [amount, setAmount] = useState(50000000);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [10000000, 20000000, 50000000, 100000000];

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(amount) || 0;
    if (num <= 0) return;

    let newBalance = currentCash;
    if (type === 'DEPOSIT') {
      newBalance += num;
    } else {
      if (num > currentCash) {
        alert('Số tiền rút vượt quá số dư tiền mặt khả dụng!');
        return;
      }
      newBalance -= num;
    }

    onUpdateCash(newBalance);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quản Lý Tiền Mặt / Sức Mua</h3>
              <span className="text-xs text-slate-400">
                Khả dụng: <strong className="text-amber-400 font-numeric">{formatCurrency(currentCash)}</strong>
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Action Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('DEPOSIT')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'DEPOSIT'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Nạp Tiền
            </button>
            <button
              type="button"
              onClick={() => setType('WITHDRAW')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'WITHDRAW'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Rút Tiền
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Số Tiền (VNĐ)
            </label>
            <input
              type="number"
              min="100000"
              step="100000"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-base font-numeric font-bold text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Quick Amounts */}
          <div className="flex flex-wrap gap-1.5">
            {quickAmounts.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
              >
                +{formatCurrency(val, 'VND', true)}
              </button>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Ghi Chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Nạp thêm từ lương tháng 8..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            />
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
              className={`px-5 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-md ${
                type === 'DEPOSIT'
                  ? 'bg-emerald-400 hover:bg-emerald-300'
                  : 'bg-rose-400 hover:bg-rose-300'
              }`}
            >
              {type === 'DEPOSIT' ? 'Xác Nhận Nạp' : 'Xác Nhận Rút'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
