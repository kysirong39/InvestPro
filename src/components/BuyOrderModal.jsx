import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Search, 
  Sparkles, 
  Layers, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Info,
  Tag
} from 'lucide-react';
import { formatCurrency, formatNumber, getWeightedAvgPrice, getRemainingQuantity } from '../utils/finance';
import { POPULAR_SYMBOLS } from '../utils/mockData';

export const BuyOrderModal = ({ 
  isOpen, 
  onClose, 
  prefilledHolding, 
  existingHoldings = [], 
  cashBalance = 0,
  onConfirmBuy 
}) => {
  const [symbol, setSymbol] = useState('FPT');
  const [name, setName] = useState('CTCP FPT');
  const [exchange, setExchange] = useState('HOSE');
  const [sector, setSector] = useState('Công nghệ');
  const [assetClass, setAssetClass] = useState('stock');
  
  // RÕ RÀNG 2 MỨC GIÁ:
  // 1. Giá vốn mua vào của lô này (Purchase Price)
  const [buyPrice, setBuyPrice] = useState(85000);
  // 2. Giá thị trường hiện tại trên bảng điện (Market Price)
  const [marketPrice, setMarketPrice] = useState(138500);
  
  const [quantity, setQuantity] = useState(1000);
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10));
  const [fee, setFee] = useState(0);
  const [note, setNote] = useState('Mua tích sản vùng hỗ trợ');

  // Sync state when prefilledHolding changes
  useEffect(() => {
    if (prefilledHolding) {
      setSymbol(prefilledHolding.symbol);
      setName(prefilledHolding.name || prefilledHolding.symbol);
      setExchange(prefilledHolding.exchange || 'HOSE');
      setSector(prefilledHolding.sector || 'Công nghệ');
      setAssetClass(prefilledHolding.assetClass || 'stock');
      setMarketPrice(prefilledHolding.currentPrice || 100000);
      setBuyPrice(prefilledHolding.currentPrice || 100000);
    }
  }, [prefilledHolding]);

  // Auto calculate estimated fee (0.15%)
  useEffect(() => {
    const totalGross = (Number(quantity) || 0) * (Number(buyPrice) || 0);
    setFee(Math.round(totalGross * 0.0015));
  }, [quantity, buyPrice]);

  if (!isOpen) return null;

  // When symbol chosen from suggestions
  const handleSelectPopularSymbol = (item) => {
    setSymbol(item.symbol);
    setName(item.name);
    setExchange(item.exchange);
    setSector(item.sector);
    setMarketPrice(item.price);
    setBuyPrice(item.price);
    if (item.symbol === 'BTC') setAssetClass('crypto');
    else if (item.symbol === 'SJC') setAssetClass('gold');
    else if (item.symbol.startsWith('E1') || item.symbol.startsWith('FUE')) setAssetClass('etf');
    else setAssetClass('stock');
  };

  const existing = existingHoldings.find(h => h.symbol.toUpperCase() === symbol.toUpperCase());
  const existingQty = existing ? getRemainingQuantity(existing.lots) : 0;
  const existingAvgPrice = existing ? getWeightedAvgPrice(existing.lots) : 0;

  const totalBuyCost = (Number(quantity) || 0) * (Number(buyPrice) || 0) + (Number(fee) || 0);

  // New simulated average price if DCAing into existing stock
  const newTotalQty = existingQty + (Number(quantity) || 0);
  const newSimulatedAvgPrice = newTotalQty > 0
    ? (existingQty * existingAvgPrice + totalBuyCost) / newTotalQty
    : buyPrice;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symbol || quantity <= 0 || buyPrice <= 0) return;

    onConfirmBuy({
      symbol: symbol.toUpperCase().trim(),
      name: name || symbol.toUpperCase(),
      exchange,
      sector,
      assetClass,
      currentPrice: Number(marketPrice) || Number(buyPrice), // Giá thị trường hiện tại
      lot: {
        id: `lot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: buyDate,
        buyPrice: Number(buyPrice), // Giá vốn mua vào của lô này
        quantity: Number(quantity),
        remainingQty: Number(quantity),
        fee: Number(fee) || 0,
        tax: 0,
        note: note || 'Mua vào'
      },
      totalCost: totalBuyCost
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {existing ? `Mua Thêm Lô Mới: ${symbol}` : 'Nhập Cổ Phiếu & Lô Mua Đầu Tiên'}
              </h3>
              <p className="text-xs text-slate-400">Phân biệt rõ ràng giữa Giá Vốn Mua Vào và Giá Thị Trường Hiện Tại</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Symbol Suggestions (Quick Click) */}
        {!prefilledHolding && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Gợi ý mã nhanh:</span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SYMBOLS.slice(0, 10).map(item => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleSelectPopularSymbol(item)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    symbol === item.symbol
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Symbol & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mã Cổ Phiếu *</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="VD: FPT, HPG, VNM..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-extrabold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Doanh Nghiệp (Tùy chọn)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: CTCP FPT"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* TWO CLEAR PRICES: BUY PRICE vs CURRENT MARKET PRICE */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thiết Lập 2 Mức Giá (Giá Vốn Mua Vào & Giá Thị Trường Trên Sàn)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. GIÁ MUA VÀO (GIÁ VỐN) */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <label className="block text-xs font-extrabold text-amber-300">
                  1. Giá Bạn Mua Vào Của Lô Này (VNĐ) *
                </label>
                <span className="text-[10px] text-slate-400 block">
                  (Mức giá vốn thực tế bạn đã khớp lệnh khi mua)
                </span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={buyPrice || ''}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  placeholder="VD: 85000"
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-base font-numeric font-extrabold text-amber-300 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* 2. GIÁ THỊ TRƯỜNG HIỆN TẠI TRÊN SÀN */}
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                <label className="block text-xs font-extrabold text-indigo-300">
                  2. Giá Thị Trường Hôm Nay Trên Sàn (VNĐ) *
                </label>
                <span className="text-[10px] text-slate-400 block">
                  (Giá hiện tại trên bảng điện để so sánh tính lãi/lỗ)
                </span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={marketPrice || ''}
                  onChange={(e) => setMarketPrice(Number(e.target.value))}
                  placeholder="VD: 138500"
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/50 rounded-xl text-base font-numeric font-extrabold text-indigo-300 focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

            </div>
          </div>

          {/* Quantity & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Số Lượng Mua Vào (CP) *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="1000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-numeric font-extrabold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày Mua Vào</label>
              <input
                type="date"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú Đợt Mua</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Mua tích sản, DCA..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* SUMMARY IMPACT PANEL */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Tổng số tiền giải ngân đợt này:</span>
              <span className="text-base font-extrabold text-amber-300 font-numeric">
                {formatCurrency(totalBuyCost)}
              </span>
            </div>

            {/* Estimated initial Unrealized P&L preview */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Ước tính Lãi/Lỗ tạm tính theo giá thị trường ({formatCurrency(marketPrice)}):</span>
              <span className={`font-bold font-numeric ${marketPrice >= buyPrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency((marketPrice - buyPrice) * quantity)} ({(((marketPrice - buyPrice) / buyPrice) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              + Xác Nhận Thêm Đợt Mua
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
