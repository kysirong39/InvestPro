import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Plus, 
  Layers, 
  Save, 
  Calendar, 
  DollarSign, 
  Tag,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/finance';

export const EditHoldingModal = ({ 
  isOpen, 
  onClose, 
  holding, 
  onSaveHolding 
}) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [exchange, setExchange] = useState('HOSE');
  const [sector, setSector] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [lots, setLots] = useState([]);

  // Sync state when holding opens
  useEffect(() => {
    if (holding) {
      setSymbol(holding.symbol || '');
      setName(holding.name || '');
      setExchange(holding.exchange || 'HOSE');
      setSector(holding.sector || '');
      setCurrentPrice(holding.currentPrice || 0);
      setLots(holding.lots ? JSON.parse(JSON.stringify(holding.lots)) : []);
    }
  }, [holding]);

  if (!isOpen || !holding) return null;

  // Handle Lot editing
  const handleLotChange = (index, field, value) => {
    const updated = [...lots];
    updated[index] = {
      ...updated[index],
      [field]: field === 'buyPrice' || field === 'quantity' || field === 'remainingQty' 
        ? Number(value) 
        : value
    };
    // If quantity changed and remaining was equal to old quantity, sync remaining
    if (field === 'quantity' && updated[index].remainingQty > Number(value)) {
      updated[index].remainingQty = Number(value);
    }
    setLots(updated);
  };

  const handleAddLot = () => {
    const newLot = {
      id: `lot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString().slice(0, 10),
      buyPrice: currentPrice || 50000,
      quantity: 1000,
      remainingQty: 1000,
      fee: 0,
      tax: 0,
      note: 'Lô mua mới'
    };
    setLots([...lots, newLot]);
  };

  const handleDeleteLot = (index) => {
    if (lots.length <= 1) {
      alert('Cổ phiếu cần có ít nhất 1 lô mua. Nếu không muốn giữ mã này, bạn có thể xóa toàn bộ mã.');
      return;
    }
    if (window.confirm(`Xóa Lô #${index + 1}?`)) {
      setLots(lots.filter((_, idx) => idx !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symbol || currentPrice <= 0 || lots.length === 0) {
      alert('Vui lòng nhập đầy đủ mã cổ phiếu, giá thị trường và ít nhất 1 lô mua hợp lệ.');
      return;
    }

    onSaveHolding({
      ...holding,
      symbol: symbol.toUpperCase().trim(),
      name: name.trim() || symbol.toUpperCase().trim(),
      exchange,
      sector,
      currentPrice: Number(currentPrice),
      lots: lots.map(l => ({
        ...l,
        buyPrice: Number(l.buyPrice) || 0,
        quantity: Number(l.quantity) || 0,
        remainingQty: Number(l.remainingQty) !== undefined ? Number(l.remainingQty) : Number(l.quantity)
      }))
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Chỉnh Sửa Cổ Phiếu & Giá Thị Trường: <span className="text-amber-300">{holding.symbol}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Cập nhật giá thị trường hiện tại, thông tin mã và chỉnh sửa lại các lô mua vào
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

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Basic Info & Current Market Price */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              <span>1. Thông Tin Cơ Bản & Giá Thị Trường Hiện Tại</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              
              {/* Mã CP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mã Cổ Phiếu *</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-extrabold text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Tên Doanh Nghiệp */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Doanh Nghiệp</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Sàn Giao Dịch */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sàn</label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="HOSE">HOSE</option>
                  <option value="HNX">HNX</option>
                  <option value="UPCOM">UPCOM</option>
                  <option value="ETF">ETF</option>
                  <option value="CRYPTO">CRYPTO</option>
                  <option value="US">US Stock</option>
                </select>
              </div>

            </div>

            {/* GIÁ THỊ TRƯỜNG HIỆN TẠI (QUAN TRỌNG NHẤT) */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="text-emerald-300 text-xs block">
                  Giá Thị Trường Hiện Tại Hôm Nay (VNĐ) *
                </strong>
                <span className="text-[11px] text-slate-400">
                  Mức giá trên bảng điện dùng để so sánh với giá vốn mua vào để tính ra Lãi/Lỗ
                </span>
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={currentPrice || ''}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  placeholder="VD: 138500"
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-500 rounded-xl text-base font-numeric font-extrabold text-emerald-300 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  required
                />
              </div>
            </div>

          </div>

          {/* Section 2: Manage Purchase Lots (Sửa Từng Lô Mua Vào) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>2. Danh Sách Các Lần Mua Vào (Giá Vốn Từng Lô)</span>
              </h4>

              <button
                type="button"
                onClick={handleAddLot}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Thêm Lô Mua Mới
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {lots.map((lot, idx) => (
                <div 
                  key={lot.id || idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                >
                  <div className="sm:col-span-1 font-bold text-slate-400">
                    Lô #{idx + 1}
                  </div>

                  {/* Ngày mua */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Ngày Mua</label>
                    <input
                      type="date"
                      value={lot.date}
                      onChange={(e) => handleLotChange(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      required
                    />
                  </div>

                  {/* Giá Mua Vào */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-amber-400 font-bold mb-0.5">Giá Mua Vào (VNĐ) *</label>
                    <input
                      type="number"
                      step="100"
                      value={lot.buyPrice || ''}
                      onChange={(e) => handleLotChange(idx, 'buyPrice', e.target.value)}
                      placeholder="85000"
                      className="w-full px-2 py-1.5 bg-slate-950 border border-amber-500/60 rounded-lg text-xs font-numeric font-extrabold text-amber-300 text-right"
                      required
                    />
                  </div>

                  {/* Số lượng còn lại */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-emerald-400 font-bold mb-0.5">Số Lượng (CP) *</label>
                    <input
                      type="number"
                      min="1"
                      value={lot.remainingQty || ''}
                      onChange={(e) => handleLotChange(idx, 'remainingQty', e.target.value)}
                      placeholder="1000"
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-numeric font-bold text-white text-right"
                      required
                    />
                  </div>

                  {/* Ghi chú */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Ghi Chú</label>
                    <input
                      type="text"
                      value={lot.note || ''}
                      onChange={(e) => handleLotChange(idx, 'note', e.target.value)}
                      placeholder="Ghi chú..."
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300"
                    />
                  </div>

                  {/* Xóa Lô */}
                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteLot(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Xóa lô này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Buttons */}
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
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cập Nhật</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
