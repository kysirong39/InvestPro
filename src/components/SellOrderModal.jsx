import React, { useState, useEffect } from 'react';
import { 
  X, 
  MinusCircle, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Sliders, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Info, 
  Calendar, 
  Percent, 
  DollarSign,
  Target,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  getRemainingQuantity, 
  getWeightedAvgPrice, 
  simulateSellAllocation,
  getLotMetrics,
  getTotalCostBasis
} from '../utils/finance';

export const SellOrderModal = ({ 
  isOpen, 
  onClose, 
  holding, 
  preselectedLotId = null,
  onConfirmSell 
}) => {
  const totalAvailableQty = holding ? getRemainingQuantity(holding.lots) : 0;
  const currentAvgPrice = holding ? getWeightedAvgPrice(holding.lots) : 0;
  const currentTotalCost = holding ? getTotalCostBasis(holding.lots) : 0;
  const activeLots = holding ? holding.lots.filter(l => (Number(l.remainingQty) || 0) > 0) : [];

  // Chế độ bán: 'TARGET_LOTS' (Chọn cụ thể từng lô) | 'AUTO_STRATEGY' (Nhập tổng khối lượng & tự động phân bổ)
  const [sellMode, setSellMode] = useState('TARGET_LOTS');
  
  const [sellQty, setSellQty] = useState(100);
  const [sellPrice, setSellPrice] = useState(0);
  const [sellDate, setSellDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('CUSTOM'); // 'CUSTOM' | 'FIFO' | 'LIFO' | 'HIGHEST_COST' | 'LOWEST_COST'
  const [customAllocations, setCustomAllocations] = useState({}); // { [lotId]: number }
  const [feeRate, setFeeRate] = useState(0.15); // 0.15% phí GD
  const [taxRate, setTaxRate] = useState(0.1);   // 0.1% thuế TNCN bán CK
  const [note, setNote] = useState('');

  // Sync state when holding or preselectedLotId changes
  useEffect(() => {
    if (holding) {
      const avail = getRemainingQuantity(holding.lots);
      setSellPrice(holding.currentPrice || 0);

      if (preselectedLotId) {
        // Nếu người dùng chọn từ 1 lô cụ thể
        setSellMode('TARGET_LOTS');
        setMethod('CUSTOM');
        const targetLot = activeLots.find(l => l.id === preselectedLotId);
        if (targetLot) {
          const lotQty = Number(targetLot.remainingQty) || 0;
          setCustomAllocations({ [preselectedLotId]: lotQty });
          setSellQty(lotQty);
        }
      } else {
        // Mặc định chọn lô đầu tiên hoặc theo custom
        setSellMode('TARGET_LOTS');
        setMethod('CUSTOM');
        if (activeLots.length > 0) {
          const firstLot = activeLots[0];
          const firstQty = Number(firstLot.remainingQty) || 0;
          setCustomAllocations({ [firstLot.id]: firstQty });
          setSellQty(firstQty);
        } else {
          setSellQty(Math.min(100, avail));
          setCustomAllocations({});
        }
      }
    }
  }, [holding, preselectedLotId]);

  if (!isOpen || !holding) return null;

  // Cập nhật số lượng bán cho 1 lô cụ thể trong chế độ TARGET_LOTS
  const handleCustomQtyChange = (lotId, qty) => {
    const targetLot = activeLots.find(l => l.id === lotId);
    const maxLotQty = targetLot ? Number(targetLot.remainingQty) : 0;
    const cleanQty = Math.max(0, Math.min(maxLotQty, Number(qty) || 0));

    const updated = {
      ...customAllocations,
      [lotId]: cleanQty
    };
    setCustomAllocations(updated);

    // Đồng bộ lại tổng sellQty
    const totalCustomSum = Object.values(updated).reduce((s, v) => s + (Number(v) || 0), 0);
    setSellQty(totalCustomSum);
  };

  // Chọn bán toàn bộ một lô (1-click)
  const handleSelectFullLot = (lotId) => {
    const targetLot = activeLots.find(l => l.id === lotId);
    if (!targetLot) return;
    const maxLotQty = Number(targetLot.remainingQty) || 0;
    handleCustomQtyChange(lotId, maxLotQty);
  };

  // Xóa chọn 1 lô
  const handleDeselectLot = (lotId) => {
    handleCustomQtyChange(lotId, 0);
  };

  // Chuyển sang chế độ phân bổ tự động (FIFO, LIFO...)
  const handleSwitchToAuto = (autoMethod) => {
    setSellMode('AUTO_STRATEGY');
    setMethod(autoMethod);
    if (sellQty <= 0) setSellQty(Math.min(100, totalAvailableQty));
  };

  // Chuyển sang chế độ chọn từng lô
  const handleSwitchToTargetLots = () => {
    setSellMode('TARGET_LOTS');
    setMethod('CUSTOM');
    // Nếu chưa có lô nào được chọn thì chọn lô đầu tiên
    if (Object.values(customAllocations).reduce((s, v) => s + v, 0) === 0 && activeLots.length > 0) {
      handleSelectFullLot(activeLots[0].id);
    }
  };

  // Quick chips for auto percentage
  const handleQuickPercent = (pct) => {
    const qty = Math.floor(totalAvailableQty * (pct / 100));
    setSellQty(qty);
    if (sellMode === 'TARGET_LOTS') {
      const initialCustom = {};
      let remain = qty;
      for (const lot of activeLots) {
        if (remain <= 0) break;
        const take = Math.min(remain, Number(lot.remainingQty));
        initialCustom[lot.id] = take;
        remain -= take;
      }
      setCustomAllocations(initialCustom);
    }
  };

  // Tính toán mô phỏng kết quả bán theo thời gian thực
  const simulation = simulateSellAllocation({
    lots: holding.lots,
    sellQty: Number(sellQty) || 0,
    sellPrice: Number(sellPrice) || 0,
    method,
    customAllocations,
    feeRate: feeRate / 100,
    taxRate: taxRate / 100
  });

  const handleExecuteSell = (e) => {
    e.preventDefault();
    if (!simulation.isValid || sellQty <= 0) return;

    if (simulation.totalRealizedPnL > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onConfirmSell({
      holdingId: holding.id,
      symbol: holding.symbol,
      sellQty: Number(sellQty),
      sellPrice: Number(sellPrice),
      sellDate,
      method: sellMode === 'TARGET_LOTS' ? 'CUSTOM (Chọn Lô)' : method,
      note: note || (sellMode === 'TARGET_LOTS' ? `Bán theo lô chỉ định (${formatNumber(sellQty)} CP)` : `Bán dần ${formatNumber(sellQty)} CP (${method})`),
      simulation
    });

    onClose();
  };

  // So sánh giá vốn mới với giá vốn cũ
  const avgPriceDiff = simulation.newAvgPrice - currentAvgPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <MinusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">
                  Lệnh Bán Dần & Chọn Lô Cổ Phiếu: <span className="text-emerald-400">{holding.symbol}</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                  {holding.exchange}
                </span>
              </div>
              <p className="text-xs text-slate-400">Chọn chính xác lô mua cần chốt lời và theo dõi giá vốn/lãi lỗ số CP còn lại</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs mb-5">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Giá TT hôm nay</span>
            <span className="font-bold text-slate-100 font-numeric">{formatCurrency(holding.currentPrice)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">KL Khả dụng bán</span>
            <span className="font-bold text-emerald-400 font-numeric">{formatNumber(totalAvailableQty)} CP</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Giá vốn TB hiện tại</span>
            <span className="font-bold text-indigo-300 font-numeric">{formatCurrency(currentAvgPrice)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Số lô mua đang có</span>
            <span className="font-bold text-amber-400 font-numeric">{activeLots.length} Lô</span>
          </div>
        </div>

        <form onSubmit={handleExecuteSell} className="space-y-5">
          
          {/* 1. SELLING MODE SELECTOR (CHỌN CÁCH BÁN) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>1. Chọn Phương Thức Bán Lô</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: TARGET SPECIFIC LOTS (Chỉ định theo từng lô) */}
              <button
                type="button"
                onClick={handleSwitchToTargetLots}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  sellMode === 'TARGET_LOTS'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${sellMode === 'TARGET_LOTS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>🎯 Chọn Lô Bán Cụ Thể</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Khuyên dùng</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Tự tay chọn bán Lô #1, Lô #2... để chủ động chốt lời theo từng mức giá mua vào.
                  </p>
                </div>
              </button>

              {/* Option B: AUTO STRATEGY (Phân bổ tự động FIFO, LIFO...) */}
              <button
                type="button"
                onClick={() => handleSwitchToAuto('FIFO')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  sellMode === 'AUTO_STRATEGY'
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${sellMode === 'AUTO_STRATEGY' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">⚡ Bán Tự Động Theo Khối Lượng</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Nhập tổng khối lượng cần bán và để hệ thống tự động trừ theo FIFO, LIFO, Giá cao...
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* 2. CHẾ ĐỘ A: DANH SÁCH TỪNG LÔ CỤ THỂ ĐỂ CHỌN BÁN */}
          {sellMode === 'TARGET_LOTS' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" /> Danh Sách Các Lô Mua Của {holding.symbol} (Chọn lô muốn bán):
                </span>
                <span className="text-slate-300 text-xs font-numeric">
                  Tổng bán: <strong className="text-emerald-400 text-sm font-extrabold">{formatNumber(sellQty)}</strong> / {formatNumber(totalAvailableQty)} CP
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {activeLots.map((lot, idx) => {
                  const val = customAllocations[lot.id] || 0;
                  const lotMet = getLotMetrics(lot, sellPrice || holding.currentPrice);
                  const isLotProfit = lotMet.pnl >= 0;
                  const isFullySelected = val === Number(lot.remainingQty) && val > 0;
                  const isPartiallySelected = val > 0 && val < Number(lot.remainingQty);

                  return (
                    <div 
                      key={lot.id || idx} 
                      className={`p-3 rounded-xl border transition-all ${
                        isFullySelected 
                          ? 'bg-emerald-950/30 border-emerald-500/50' 
                          : isPartiallySelected 
                            ? 'bg-indigo-950/25 border-indigo-500/40' 
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Lot info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-extrabold text-sm text-white">Lô #{idx + 1}</span>
                            <span className="text-xs text-slate-400 font-numeric">({lot.date})</span>
                            <span className="font-numeric font-extrabold text-amber-300 text-sm px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30">
                              Mua: {formatCurrency(lot.buyPrice)}
                            </span>
                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                              isLotProfit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isLotProfit ? '+' : ''}{formatCurrency(lotMet.pnl)} ({formatPercent(lotMet.pnlPercent)})
                            </span>
                          </div>
                          
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>Khả dụng: <strong className="text-emerald-400 font-numeric">{formatNumber(lot.remainingQty)} CP</strong></span>
                            {lot.note && <span className="text-slate-500 italic">• {lot.note}</span>}
                          </div>
                        </div>

                        {/* Quick Action & Input */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* 1-Click Select Full Lot */}
                          <button
                            type="button"
                            onClick={() => isFullySelected ? handleDeselectLot(lot.id) : handleSelectFullLot(lot.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isFullySelected 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                            }`}
                          >
                            {isFullySelected ? '✕ Bỏ chọn' : `⚡ Bán hết (${formatNumber(lot.remainingQty)})`}
                          </button>

                          {/* Custom quantity input */}
                          <div className="w-28 relative">
                            <input
                              type="number"
                              min="0"
                              max={lot.remainingQty}
                              value={val === 0 ? '' : val}
                              onChange={(e) => handleCustomQtyChange(lot.id, e.target.value)}
                              placeholder="Số lượng"
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-numeric font-bold text-white text-xs focus:outline-none focus:border-rose-500"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">CP</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CHẾ ĐỘ B: PHÂN BỔ TỰ ĐỘNG (FIFO, LIFO, GIÁ CAO...) */}
          {sellMode === 'AUTO_STRATEGY' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              
              {/* Strategy selector chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Chọn Thuật Toán Cắt Lô Tự Động:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'FIFO', label: '1. FIFO', desc: 'Mua trước bán trước (Cũ nhất)' },
                    { key: 'LIFO', label: '2. LIFO', desc: 'Mua sau bán trước (Mới nhất)' },
                    { key: 'HIGHEST_COST', label: '3. Giá cao nhất', desc: 'Thu hồi vốn đắt / Cắt lỗ' },
                    { key: 'LOWEST_COST', label: '4. Giá rẻ nhất', desc: 'Chốt lời tối đa' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setMethod(opt.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        method === opt.key
                          ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity input with % chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tổng Khối Lượng Bán (CP)</label>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleQuickPercent(pct)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {pct === 100 ? 'Tất cả (100%)' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max={totalAvailableQty}
                  value={sellQty || ''}
                  onChange={(e) => setSellQty(Math.min(totalAvailableQty, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-numeric text-white focus:outline-none focus:border-rose-500 font-bold"
                  required
                />
              </div>

            </div>
          )}

          {/* 4. GIÁ BÁN DỰ KIẾN & NGÀY BÁN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Giá Bán Khớp Lệnh (VNĐ)</label>
                <button
                  type="button"
                  onClick={() => setSellPrice(holding.currentPrice)}
                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  Dùng giá thị trường ({formatCurrency(holding.currentPrice, 'VND', true)})
                </button>
              </div>
              <input
                type="number"
                min="100"
                step="100"
                value={sellPrice || ''}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-numeric text-emerald-300 focus:outline-none focus:border-rose-500 font-extrabold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày Thực Hiện Bán</label>
              <input
                type="date"
                value={sellDate}
                onChange={(e) => setSellDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          {/* 5. BẢNG MÔ PHỎNG CHI TIẾT ĐỢT BÁN & TÁC ĐỘNG ĐỐI VỚI CỔ PHIẾU CÒN LẠI */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Bảng Xem Trước Phân Bổ Bán & Trạng Thái Cổ Phiếu Còn Lại
              </span>
              <span className="text-slate-400 text-xs font-numeric">
                Khối lượng bán: <strong className="text-white text-sm">{formatNumber(sellQty)} CP</strong>
              </span>
            </div>

            {simulation.allocatedLots.length > 0 ? (
              <div className="space-y-4">
                
                {/* Detailed Lot Cut Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-800/80 pb-1">
                        <th className="pb-1.5">Lô Bị Cắt</th>
                        <th className="pb-1.5">Ngày Mua</th>
                        <th className="pb-1.5 text-right">Giá Mua Lô</th>
                        <th className="pb-1.5 text-right text-rose-400">KL Bán</th>
                        <th className="pb-1.5 text-right">Lãi / Lỗ Lô Này</th>
                        <th className="pb-1.5 text-right">KL Còn Lại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {simulation.allocatedLots.map((alloc, aIdx) => {
                        const isAllocProfit = alloc.realizedPnL >= 0;
                        return (
                          <tr key={alloc.lotId || aIdx} className="hover:bg-slate-800/20">
                            <td className="py-2 font-bold text-slate-300">Lô #{aIdx + 1}</td>
                            <td className="py-2 text-slate-400">{alloc.lotDate}</td>
                            <td className="py-2 text-right font-numeric font-bold text-amber-300">
                              {formatCurrency(alloc.buyPrice)}
                            </td>
                            <td className="py-2 text-right font-numeric font-extrabold text-rose-400">
                              -{formatNumber(alloc.qtySold)} CP
                            </td>
                            <td className="py-2 text-right font-numeric">
                              <span className={`font-bold ${isAllocProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isAllocProfit ? '+' : ''}{formatCurrency(alloc.realizedPnL)} ({formatPercent(alloc.realizedPnLPct)})
                              </span>
                            </td>
                            <td className="py-2 text-right font-numeric text-slate-400">
                              {formatNumber(alloc.lotRemainingAfter)} CP
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2-Column Impact Grid: Sold Results vs Remaining Portfolio State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  
                  {/* Cột 1: Kết Quả Bán Lần Này */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. Kết Quả Bán Lần Này</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tiền thực thu (Net):</span>
                      <strong className="text-white font-numeric text-sm font-black">{formatCurrency(simulation.netProceeds)}</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Lãi / Lỗ chốt thực tế:</span>
                      <strong className={`font-numeric text-sm font-black ${simulation.totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {simulation.totalRealizedPnL >= 0 ? '+' : ''}{formatCurrency(simulation.totalRealizedPnL)} ({formatPercent(simulation.totalRealizedPnLPct)})
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Thuế & Phí (0.25%):</span>
                      <span className="font-numeric">{formatCurrency(simulation.totalFeeAndTax)}</span>
                    </div>
                  </div>

                  {/* Cột 2: Trạng Thái Cổ Phiếu CÒN LẠI Sau Khi Bán */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-2">
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-900/40 pb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>2. Cổ Phiếu Còn Lại Sau Bán</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Số lượng còn nắm giữ:</span>
                      <strong className="text-emerald-400 font-numeric text-sm font-black">{formatNumber(simulation.newTotalQty)} CP</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Giá vốn TB MỚI (WAC):</span>
                      <div className="text-right">
                        <strong className="text-indigo-300 font-numeric text-sm font-black">{formatCurrency(simulation.newAvgPrice)}</strong>
                        {avgPriceDiff !== 0 && (
                          <span className={`text-[10px] ml-1.5 font-bold ${avgPriceDiff < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            ({avgPriceDiff < 0 ? 'Giảm' : 'Tăng'} {formatCurrency(Math.abs(avgPriceDiff))})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-900/30">
                      <span className="text-slate-400">Lãi/Lỗ tạm tính còn lại:</span>
                      <strong className={`font-numeric text-xs font-bold ${simulation.remainingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {simulation.remainingPnL >= 0 ? '+' : ''}{formatCurrency(simulation.remainingPnL || 0)} ({formatPercent(simulation.remainingPnLPct || 0)})
                      </strong>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="py-4 text-center text-slate-500 text-xs">
                Vui lòng chọn ít nhất một lô hoặc nhập khối lượng bán hợp lệ.
              </div>
            )}

          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú Lệnh Bán</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Chốt lời Lô 1 mua giá rẻ, giữ lại Lô 2..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={!simulation.isValid || sellQty <= 0}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all ${
                simulation.isValid && sellQty > 0
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-500/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>Xác Nhận Bán {formatNumber(sellQty)} CP {holding.symbol}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
