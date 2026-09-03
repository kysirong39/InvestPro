import React from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  PieChart, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  getMarketValue, 
  getUnrealizedPnL, 
  getRemainingQuantity,
  getLotMetrics
} from '../utils/finance';

export const FinancialAdvisor = ({ 
  holdings = [], 
  cashBalance = 0, 
  onOpenSellModal,
  onOpenBuyModal 
}) => {
  const activeHoldings = holdings.filter(h => getRemainingQuantity(h.lots) > 0);
  const totalStockValue = activeHoldings.reduce((s, h) => s + getMarketValue(h), 0);
  const totalNetWorth = totalStockValue + cashBalance;

  // 1. Phân tích tập trung rủi ro (Concentration Risk)
  const concentrationAlerts = [];
  activeHoldings.forEach(h => {
    const val = getMarketValue(h);
    const weight = totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0;
    if (weight > 30) {
      concentrationAlerts.push({
        holding: h,
        weight,
        message: `Mã ${h.symbol} đang chiếm ${weight.toFixed(1)}% tổng tài sản. Mức khuyến nghị tối đa cho 1 cổ phiếu là 20-25%.`
      });
    }
  });

  // 2. Phân tích các lô đang có lãi lớn cần chốt lời từng phần (DCA Out / Take Profit)
  const profitTakingSuggestions = [];
  activeHoldings.forEach(h => {
    h.lots.forEach((lot, idx) => {
      if (lot.remainingQty > 0) {
        const lotMet = getLotMetrics(lot, h.currentPrice);
        if (lotMet.pnlPercent >= 30) {
          profitTakingSuggestions.push({
            holding: h,
            lot,
            lotIndex: idx + 1,
            pnlPercent: lotMet.pnlPercent,
            pnlAmount: lotMet.pnl,
            message: `Lô #${idx + 1} của ${h.symbol} mua ngày ${lot.date} đang lãi ${formatPercent(lotMet.pnlPercent)} (+${formatCurrency(lotMet.pnl)}). Khuyến nghị chốt lời dần 20-30% lô này để khóa lợi nhuận!`
          });
        }
      }
    });
  });

  // 3. Phân tích các lô vi phạm cắt lỗ (Stop-Loss Risk)
  const stopLossAlerts = [];
  activeHoldings.forEach(h => {
    h.lots.forEach((lot, idx) => {
      if (lot.remainingQty > 0) {
        const lotMet = getLotMetrics(lot, h.currentPrice);
        if (lotMet.pnlPercent <= -7) {
          stopLossAlerts.push({
            holding: h,
            lot,
            lotIndex: idx + 1,
            pnlPercent: lotMet.pnlPercent,
            pnlAmount: lotMet.pnl,
            message: `Lô #${idx + 1} của ${h.symbol} mua ngày ${lot.date} đang lỗ ${formatPercent(lotMet.pnlPercent)}. Cân nhắc cắt lỗ theo quy tắc phòng thủ rủi ro 7-8%.`
          });
        }
      }
    });
  });

  // Tỷ lệ tiền mặt
  const cashRatio = totalNetWorth > 0 ? (cashBalance / totalNetWorth) * 100 : 0;

  // Tính điểm sức khỏe danh mục (Portfolio Health Score)
  let healthScore = 90;
  if (concentrationAlerts.length > 0) healthScore -= 15;
  if (stopLossAlerts.length > 0) healthScore -= 10 * stopLossAlerts.length;
  if (cashRatio < 5) healthScore -= 10;
  if (cashRatio > 50) healthScore -= 5;
  healthScore = Math.max(30, Math.min(98, healthScore));

  return (
    <div className="space-y-6">
      
      {/* Advisor Hero Banner */}
      <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Chuyên Gia Tư Vấn Quản Trị Danh Mục & Chiến Lược Lô Mua</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  AI Financial Expert
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Đánh giá rủi ro danh mục theo nguyên lý William O'Neil (CANSLIM), Mark Minervini và chiến lược tối ưu giá vốn bình quân qua bán dần (Tax-Lot Realization).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Điểm Sức Khỏe</span>
              <span className="text-2xl font-extrabold font-numeric text-indigo-400">{healthScore}/100</span>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/40 border-t-indigo-400 flex items-center justify-center font-bold text-xs text-white">
              {healthScore >= 80 ? 'A' : healthScore >= 60 ? 'B' : 'C'}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Insight Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Đa dạng hóa & Tỷ trọng */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <PieChart className="w-4 h-4" />
            <h4>Cân Bằng & Tỷ Trọng</h4>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Tỷ lệ tiền mặt hiện tại:</span>
              <span className="font-bold text-amber-300 font-numeric">{cashRatio.toFixed(1)}% ({formatCurrency(cashBalance)})</span>
              <p className="text-[10px] text-slate-500 mt-1">
                {cashRatio < 10 
                  ? '⚠️ Tiền mặt dưới 10%, nên hạn chế mua đuổi, dự phòng sức mua cho nhịp điều chỉnh.' 
                  : '✅ Tỷ lệ tiền mặt an toàn, sẵn sàng giải ngân khi xuất hiện điểm mua đẹp.'}
              </p>
            </div>

            {concentrationAlerts.length > 0 ? (
              concentrationAlerts.map((alt, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-[11px]">
                  <strong>⚠️ Cảnh báo tỷ trọng cao:</strong> {alt.message}
                </div>
              ))
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Danh mục phân bổ đồng đều, không có mã nào vượt quá 30% NAV.
              </div>
            )}
          </div>
        </div>

        {/* Pillar 2: Gợi ý Chốt Lời Từng Lô (Take Profit) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <h4>Gợi Ý Chốt Lời Từng Lô</h4>
          </div>

          <div className="text-xs space-y-2 max-h-64 overflow-y-auto pr-1">
            {profitTakingSuggestions.length > 0 ? (
              profitTakingSuggestions.map((sug, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-xs">{sug.holding.symbol} (Lô #{sug.lotIndex})</span>
                    <span className="font-bold text-emerald-400 font-numeric">+{sug.pnlPercent.toFixed(1)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{sug.message}</p>
                  <button
                    onClick={() => onOpenSellModal(sug.holding)}
                    className="w-full py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    Bán dần lô này ngay <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-center">
                Chưa có lô nào đạt ngưỡng lãi đột biến (&gt;30%). Tiếp tục gồng lãi theo xu hướng!
              </div>
            )}
          </div>
        </div>

        {/* Pillar 3: Quản trị Rủi ro Cắt Lỗ (Stop-Loss) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <h4>Cảnh Báo Cắt Lỗ Phòng Thủ</h4>
          </div>

          <div className="text-xs space-y-2 max-h-64 overflow-y-auto pr-1">
            {stopLossAlerts.length > 0 ? (
              stopLossAlerts.map((alt, i) => (
                <div key={i} className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-xs">{alt.holding.symbol} (Lô #{alt.lotIndex})</span>
                    <span className="font-bold text-rose-400 font-numeric">{alt.pnlPercent.toFixed(1)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{alt.message}</p>
                  <button
                    onClick={() => onOpenSellModal(alt.holding)}
                    className="w-full py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    Cắt giảm lô này <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                Không có lô mua nào vi phạm ngưỡng cắt lỗ -7%. Toàn bộ danh mục đang được bảo vệ an toàn.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
