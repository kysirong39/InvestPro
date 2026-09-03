import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  PlusCircle, 
  MinusCircle, 
  Eye, 
  Trash2, 
  Search, 
  Edit3, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  Tag,
  DollarSign,
  HelpCircle,
  BarChart2,
  Settings
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  getRemainingQuantity, 
  getTotalCostBasis, 
  getWeightedAvgPrice, 
  getMarketValue, 
  getUnrealizedPnL,
  getLotMetrics
} from '../utils/finance';

export const HoldingsTable = ({ 
  holdings, 
  onOpenBuyModal, 
  onOpenSellModal, 
  onOpenLotDetails, 
  onOpenEditHolding,
  onOpenQuickPriceUpdater,
  onOpenApiSettings,
  onDeleteHolding,
  onUpdateHoldingPrice,
  onDeleteLot,
  onSyncLivePrices,
  isSyncingPrices,
  lastSyncTime,
  apiSource,
  onOpenResetModal,
  onResetSampleData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({}); // { [holdingId]: boolean }
  const [inputPrices, setInputPrices] = useState({}); // temporary input values

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePriceInputChange = (holdingId, value) => {
    setInputPrices(prev => ({
      ...prev,
      [holdingId]: value
    }));
  };

  const handleCommitPrice = (holdingId) => {
    const rawVal = inputPrices[holdingId];
    if (rawVal !== undefined && rawVal !== '') {
      const num = Number(rawVal);
      if (!isNaN(num) && num > 0) {
        onUpdateHoldingPrice(holdingId, num);
      }
    }
  };

  const filteredHoldings = holdings.filter(h => 
    h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Tính tổng số tiền theo giá mua, giá thị trường, tổng lãi/lỗ của toàn bộ danh mục
  const totalCostBasis = filteredHoldings.reduce((sum, h) => sum + getTotalCostBasis(h.lots), 0);
  const totalMarketValue = filteredHoldings.reduce((sum, h) => sum + getMarketValue(h), 0);
  const totalShares = filteredHoldings.reduce((sum, h) => sum + getRemainingQuantity(h.lots), 0);
  const totalPnL = totalMarketValue - totalCostBasis;
  const totalPnLPercent = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;
  const isTotalProfit = totalPnL >= 0;

  return (
    <div className="space-y-4">
      
      {/* Price Management & Action Header Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã CP (FPT, HPG, MWG, TCB...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        {/* Right: API Sync & Quick Edit & Reset & Add Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Edit All Prices Button */}
          {holdings.length > 0 && (
            <button
              onClick={onOpenQuickPriceUpdater}
              className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Mở bảng sửa giá thị trường cho toàn bộ danh mục"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sửa Nhanh Bảng Giá</span>
            </button>
          )}

          {/* Live API Sync Button */}
          <button
            onClick={onSyncLivePrices}
            disabled={isSyncingPrices}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              isSyncingPrices 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300'
            }`}
            title="Thử lấy giá tự động từ API sàn chứng khoán (VNDIRECT / DNSE)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPrices ? 'animate-spin' : ''}`} />
            <span>{isSyncingPrices ? 'Đang tải...' : 'Lấy Giá Tự Động (API)'}</span>
          </button>

          {/* API Settings Button */}
          <button
            onClick={onOpenApiSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 text-slate-400 hover:text-indigo-300 transition-all"
            title="Cấu hình nguồn API & Kiểm tra kết nối"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset / Clear All Button */}
          {holdings.length > 0 && (
            <button
              onClick={onOpenResetModal}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all"
              title="Xóa toàn bộ danh mục để bắt đầu thiết lập mới từ đầu"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Hết</span>
            </button>
          )}

          {/* Add Stock / Lot Button */}
          <button
            onClick={() => onOpenBuyModal(null)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nhập Cổ Phiếu / Lô Mua</span>
          </button>

        </div>

      </div>

      {/* Distinction Guide Bar (Bảng giải thích trực quan để không nhầm lẫn) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">1</div>
          <div>
            <strong className="text-amber-300 block">Giá Mua Vào (Giá Vốn Từng Lô)</strong>
            <span className="text-[11px] text-slate-400">Số tiền bạn đã bỏ ra khi khớp lệnh mua đợt đó</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold">2</div>
          <div>
            <strong className="text-indigo-300 block">Giá Vốn TB (WAC)</strong>
            <span className="text-[11px] text-slate-400">Giá vốn bình quân tự động tính từ các đợt mua</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">3</div>
          <div>
            <strong className="text-emerald-300 block">Giá Thị Trường Hôm Nay</strong>
            <span className="text-[11px] text-slate-400">Giá trên bảng điện hiện tại (gõ sửa tay trực tiếp)</span>
          </div>
        </div>
      </div>

      {/* Main Portfolio Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                
                {/* 1. THAO TÁC */}
                <th className="py-3 px-2 text-center w-[185px]">
                  <span className="text-slate-200">Thao Tác</span>
                </th>

                {/* 2. MÃ CỔ PHIẾU (Chỉ giữ mã, bỏ tên công ty) */}
                <th className="py-3 px-2 text-center w-[75px]">Mã CP</th>
                
                {/* 3. GIÁ MUA VÀO TỪNG ĐỢT */}
                <th className="py-3 px-2.5 bg-amber-950/10 border-l border-amber-900/30">
                  <div className="flex items-center gap-1 text-amber-300">
                    <Layers className="w-3 h-3" />
                    <span>Giá Mua Vào (Từng Lô)</span>
                  </div>
                </th>

                {/* 4. KHỐI LƯỢNG */}
                <th className="py-3 px-2 text-right w-[85px]">Khối Lượng</th>

                {/* 5. GIÁ VỐN BÌNH QUÂN */}
                <th className="py-3 px-2 text-right bg-indigo-950/30 text-indigo-300 border-x border-indigo-900/40 w-[105px]">
                  Giá Vốn TB
                </th>

                {/* 6. GIÁ THỊ TRƯỜNG HIỆN TẠI (SỬA TAY) */}
                <th className="py-3 px-2 text-right bg-emerald-950/15 border-r border-emerald-900/30 w-[130px]">
                  <div className="flex items-center justify-end gap-1 text-emerald-300">
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>Giá TT Hôm Nay</span>
                  </div>
                </th>

                {/* 7. LÃI / LỖ TẠM TÍNH */}
                <th className="py-3 px-2 text-right w-[120px]">Lãi / Lỗ Tạm Tính</th>

                {/* 8. TỔNG GIÁ TRỊ THỊ TRƯỜNG */}
                <th className="py-3 px-2.5 text-right w-[115px]">Tổng Giá Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-lg">
                        <Layers className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-white">Danh mục đầu tư đang trống</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Hãy nhập mã cổ phiếu và giá mua từng đợt để ứng dụng bắt đầu quản lý danh mục và tính toán lãi lỗ chi tiết cho bạn.
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => onOpenBuyModal(null)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                        >
                          <PlusCircle className="w-4 h-4" /> + Nhập Cổ Phiếu Đầu Tiên
                        </button>

                        <button
                          onClick={onResetSampleData}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Nạp Dữ Liệu Mẫu
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHoldings.map((holding) => {
                  const totalQty = getRemainingQuantity(holding.lots);
                  const avgPrice = getWeightedAvgPrice(holding.lots);
                  const marketVal = getMarketValue(holding);
                  const { pnl, pnlPercent } = getUnrealizedPnL(holding);
                  const isProfit = pnl >= 0;
                  const isExpanded = !!expandedRows[holding.id];
                  const activeLots = holding.lots.filter(l => (Number(l.remainingQty) || 0) > 0);
                  const currentInputValue = inputPrices[holding.id] !== undefined 
                    ? inputPrices[holding.id] 
                    : holding.currentPrice;

                  return (
                    <React.Fragment key={holding.id}>
                      <tr className={`transition-colors hover:bg-slate-800/30 ${isExpanded ? 'bg-slate-900/80' : ''}`}>
                        
                        {/* 1. CỘT THAO TÁC GỌN GÀNG */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* Expand / Collapse Button */}
                            <button
                              onClick={() => toggleRow(holding.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                              title={isExpanded ? 'Thu gọn' : 'Xem chi tiết các lô mua'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Buy More (DCA) */}
                            <button
                              onClick={() => onOpenBuyModal(holding)}
                              className="px-1.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 font-bold text-[10px] flex items-center gap-0.5 transition-all"
                              title="Mua thêm đợt mới (DCA)"
                            >
                              <PlusCircle className="w-3 h-3" /> Mua
                            </button>

                            {/* Sell Partially (Bán dần) */}
                            <button
                              onClick={() => onOpenSellModal(holding)}
                              disabled={totalQty <= 0}
                              className="px-1.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 font-bold text-[10px] flex items-center gap-0.5 transition-all"
                              title="Bán dần (Chốt lời / Cắt lỗ từng lô)"
                            >
                              <MinusCircle className="w-3 h-3" /> Bán
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => onOpenEditHolding(holding)}
                              className="px-1.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 font-bold text-[10px] flex items-center gap-0.5 shadow-sm transition-all"
                              title="Sửa giá thị trường, mã CP, và các lô mua vào"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" /> Sửa
                            </button>

                            {/* Delete Stock */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa mã ${holding.symbol} khỏi danh mục?`)) {
                                  onDeleteHolding(holding.id);
                                }
                              }}
                              className="p-1 rounded-md bg-slate-900 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-all"
                              title="Xóa mã này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                          </div>
                        </td>

                        {/* 2. MÃ CỔ PHIẾU (Chỉ giữ mã và sàn, bỏ tên dài) */}
                        <td className="py-2.5 px-2 text-center font-numeric">
                          <div className="font-black text-sm text-white tracking-wide">
                            {holding.symbol}
                          </div>
                          {holding.exchange && (
                            <span className="text-[9px] font-semibold text-slate-400 uppercase leading-none block">
                              {holding.exchange}
                            </span>
                          )}
                        </td>

                        {/* 3. GIÁ CÁC LẦN MUA VÀO (GIÁ VỐN TỪNG LÔ) */}
                        <td className="py-2.5 px-2.5 bg-amber-950/5 border-l border-amber-900/20">
                          <div className="flex flex-wrap items-center gap-1">
                            {activeLots.map((lot, lIdx) => {
                              return (
                                <div
                                  key={lot.id || lIdx}
                                  onClick={() => onOpenLotDetails(holding, lot)}
                                  className="cursor-pointer px-1.5 py-0.5 rounded-md border border-amber-500/40 bg-amber-950/40 text-amber-200 text-[11px] font-numeric flex items-center gap-1 transition-all hover:scale-105 shadow-sm"
                                  title={`Lô ${lIdx + 1} mua ngày ${lot.date}: Mua giá ${formatCurrency(lot.buyPrice)} - KL: ${formatNumber(lot.remainingQty)} CP`}
                                >
                                  <span className="text-[9px] text-amber-400 font-bold">#{lIdx + 1}:</span>
                                  <strong className="text-amber-300 font-extrabold">{formatCurrency(lot.buyPrice, 'VND', true)}</strong>
                                  <span className="text-[9px] text-slate-400 font-medium">({formatNumber(lot.remainingQty)})</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* 4. Khối lượng */}
                        <td className="py-2.5 px-2 text-right font-numeric">
                          <div className="font-extrabold text-slate-200 text-xs sm:text-sm">
                            {formatNumber(totalQty)}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {activeLots.length} lô
                          </div>
                        </td>

                        {/* 5. WEIGHTED AVERAGE COST (GIÁ VỐN BÌNH QUÂN) */}
                        <td className="py-2.5 px-2 text-right font-numeric bg-indigo-950/20 border-x border-indigo-900/30">
                          <div className="font-extrabold text-indigo-300 text-xs sm:text-sm">
                            {formatCurrency(avgPrice, 'VND', true)}
                          </div>
                          <div className="text-[9px] text-indigo-400/70 font-medium">
                            Giá vốn TB
                          </div>
                        </td>

                        {/* 6. DIRECT INLINE EDITABLE MARKET PRICE INPUT (GIÁ THỊ TRƯỜNG HÔM NAY) */}
                        <td className="py-2 px-2 text-right bg-emerald-950/10 border-r border-emerald-900/20">
                          <div className="flex items-center justify-end gap-1">
                            <div className="relative w-24 sm:w-28">
                              <input
                                type="number"
                                step="100"
                                value={currentInputValue}
                                onChange={(e) => {
                                  handlePriceInputChange(holding.id, e.target.value);
                                  const num = Number(e.target.value);
                                  if (!isNaN(num) && num > 0) {
                                    onUpdateHoldingPrice(holding.id, num);
                                  }
                                }}
                                onBlur={() => handleCommitPrice(holding.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCommitPrice(holding.id);
                                }}
                                placeholder="Nhập giá..."
                                className="w-full px-2 py-1 bg-slate-950 border border-emerald-500/50 hover:border-emerald-400 focus:border-emerald-300 rounded-lg text-right font-numeric font-extrabold text-emerald-300 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
                                title="Giá giao dịch hôm nay trên sàn (gõ vào để cập nhật)"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">₫</span>
                          </div>
                        </td>

                        {/* 7. Unrealized PnL (LÃI / LỖ TẠM TÍNH) */}
                        <td className="py-2.5 px-2 text-right font-numeric">
                          <div className={`font-extrabold text-xs sm:text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}{formatCurrency(pnl, 'VND', true)}
                          </div>
                          <span className={`inline-block px-1 py-0.2 rounded text-[10px] font-bold ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatPercent(pnlPercent)}
                          </span>
                        </td>

                        {/* 8. Market Value (TỔNG GIÁ TRỊ) */}
                        <td className="py-2.5 px-2.5 text-right font-numeric font-extrabold text-slate-100 text-xs sm:text-sm">
                          {formatCurrency(marketVal, 'VND', true)}
                        </td>

                      </tr>

                      {/* INLINE EXPANDABLE DRAWER: CHI TIẾT TỪNG LẦN MUA VÀO */}
                      {isExpanded && (
                        <tr className="bg-slate-950/95 border-b border-slate-800">
                          <td colSpan="8" className="p-4 sm:p-5">
                            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-inner">
                              
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-emerald-400" />
                                  <h4 className="font-extrabold text-sm text-white">
                                    Chi Tiết Các Lần Mua Vào Của {holding.symbol}
                                  </h4>
                                  <span className="text-xs text-slate-400">
                                    (Giá vốn TB: <strong className="text-indigo-300 font-numeric">{formatCurrency(avgPrice)}</strong> | Giá TT hôm nay: <strong className="text-emerald-300 font-numeric">{formatCurrency(holding.currentPrice)}</strong>)
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onOpenBuyModal(holding)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> + Mua Thêm Lô Mới
                                  </button>
                                  <button
                                    onClick={() => onOpenSellModal(holding)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                                  >
                                    <MinusCircle className="w-3.5 h-3.5" /> Bán Dần Từng Lô
                                  </button>
                                </div>
                              </div>

                              {/* Detailed Lots Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-800/80 pb-2">
                                      <th className="pb-2">Lô Mua</th>
                                      <th className="pb-2">Ngày Mua Vào</th>
                                      <th className="pb-2 text-right text-amber-300 font-bold">1. Giá Mua Vào (Giá Vốn)</th>
                                      <th className="pb-2 text-right">KL Ban Đầu</th>
                                      <th className="pb-2 text-right text-emerald-400 font-bold">KL Còn Lại</th>
                                      <th className="pb-2 text-right">Tổng Vốn Lô</th>
                                      <th className="pb-2 text-right text-emerald-300 font-bold">2. Giá TT Hôm Nay</th>
                                      <th className="pb-2 text-right font-bold">Lãi / Lỗ Lô Này</th>
                                      <th className="pb-2">Ghi Chú</th>
                                      <th className="pb-2 text-center">Bán Lô</th>
                                      <th className="pb-2 text-center">Xóa Lô</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/50">
                                    {holding.lots.map((lot, idx) => {
                                      const lotMet = getLotMetrics(lot, holding.currentPrice);
                                      const isSoldOut = lot.remainingQty === 0;
                                      const isLotProfit = lotMet.pnl >= 0;

                                      return (
                                        <tr key={lot.id || idx} className={`hover:bg-slate-800/30 ${isSoldOut ? 'opacity-40 line-through' : ''}`}>
                                          <td className="py-2.5 font-bold text-slate-300">Lô #{idx + 1}</td>
                                          <td className="py-2.5 text-slate-300 font-numeric">{lot.date}</td>
                                          
                                          {/* GIÁ MUA VÀO (GIÁ VỐN) */}
                                          <td className="py-2.5 text-right font-numeric font-extrabold text-amber-300 text-sm">
                                            {formatCurrency(lot.buyPrice)}
                                          </td>

                                          <td className="py-2.5 text-right font-numeric text-slate-400">
                                            {formatNumber(lot.quantity)}
                                          </td>
                                          <td className="py-2.5 text-right font-numeric font-extrabold text-emerald-400 text-sm">
                                            {formatNumber(lot.remainingQty)} CP
                                          </td>
                                          <td className="py-2.5 text-right font-numeric text-slate-300">
                                            {formatCurrency(lotMet.cost)}
                                          </td>

                                          {/* GIÁ THỊ TRƯỜNG HÔM NAY */}
                                          <td className="py-2.5 text-right font-numeric font-extrabold text-emerald-300 text-sm">
                                            {formatCurrency(holding.currentPrice)}
                                          </td>

                                          {/* LÃI / LỖ TẠM TÍNH */}
                                          <td className="py-2.5 text-right font-numeric">
                                            <span className={`font-bold ${isLotProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                              {isLotProfit ? '+' : ''}{formatCurrency(lotMet.pnl)} ({formatPercent(lotMet.pnlPercent)})
                                            </span>
                                          </td>
                                          <td className="py-2.5 text-slate-400 italic">
                                            {lot.note || '—'}
                                          </td>
                                          <td className="py-2.5 text-center">
                                            <button
                                              onClick={() => onOpenSellModal(holding, lot.id)}
                                              disabled={lot.remainingQty <= 0}
                                              className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold inline-flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                              title={`Bán Lô #${idx + 1}`}
                                            >
                                              <MinusCircle className="w-3 h-3" /> Bán Lô
                                            </button>
                                          </td>
                                          <td className="py-2.5 text-center">
                                            <button
                                              onClick={() => {
                                                if (window.confirm(`Xác nhận xóa Lô #${idx + 1} của ${holding.symbol}?`)) {
                                                  onDeleteLot(holding.id, lot.id);
                                                }
                                              }}
                                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                                              title="Xóa lô này"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* SUMMARY TOTALS ROW (DÒNG TỔNG CỘNG DANH MỤC) */}
            {filteredHoldings.length > 0 && (
              <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-extrabold text-xs">
                <tr className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                  
                  {/* 1. THAO TÁC / LABEL */}
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-indigo-300 tracking-wider">
                      <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>TỔNG CỘNG</span>
                    </div>
                  </td>

                  {/* 2. MÃ CỔ PHIẾU */}
                  <td className="py-3 px-2 text-center text-slate-400 font-bold">
                    {filteredHoldings.length} mã
                  </td>

                  {/* 3. TỔNG VỐN MUA VÀO (GIÁ MUA) */}
                  <td className="py-3 px-2.5 bg-amber-950/20 border-l border-amber-900/40">
                    <div className="text-[10px] font-medium text-amber-400/80">Tổng vốn mua vào:</div>
                    <div className="font-numeric font-black text-amber-300 text-xs sm:text-sm">
                      {formatCurrency(totalCostBasis, 'VND', true)}
                    </div>
                  </td>

                  {/* 4. TỔNG KHỐI LƯỢNG */}
                  <td className="py-3 px-2 text-right font-numeric font-extrabold text-slate-200 text-xs sm:text-sm">
                    {formatNumber(totalShares)}
                  </td>

                  {/* 5. GIÁ VỐN TB */}
                  <td className="py-3 px-2 text-right font-numeric bg-indigo-950/30 text-indigo-300 border-x border-indigo-900/40 text-xs sm:text-sm font-black">
                    {formatCurrency(totalCostBasis, 'VND', true)}
                  </td>

                  {/* 6. TỔNG GIÁ TRỊ THỊ TRƯỜNG */}
                  <td className="py-3 px-2 text-right bg-emerald-950/20 border-r border-emerald-900/40">
                    <div className="text-[10px] font-medium text-emerald-400/80">Tổng giá TT:</div>
                    <div className="font-numeric font-black text-emerald-300 text-xs sm:text-sm">
                      {formatCurrency(totalMarketValue, 'VND', true)}
                    </div>
                  </td>

                  {/* 7. TỔNG LÃI / LỖ */}
                  <td className="py-3 px-2 text-right font-numeric">
                    <div className={`font-black text-xs sm:text-sm ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isTotalProfit ? '+' : ''}{formatCurrency(totalPnL, 'VND', true)}
                    </div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black ${
                      isTotalProfit ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                    }`}>
                      {formatPercent(totalPnLPercent)}
                    </span>
                  </td>

                  {/* 8. TỔNG GIÁ TRỊ */}
                  <td className="py-3 px-2.5 text-right font-numeric font-black text-white text-xs sm:text-sm">
                    {formatCurrency(totalMarketValue, 'VND', true)}
                  </td>

                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};
