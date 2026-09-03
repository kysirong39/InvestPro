/**
 * Financial Calculation Engine & Lot Allocator
 * Quản lý danh mục tài sản, tính giá vốn bình quân, và phân bổ lô mua bán dần.
 */

// Định dạng tiền tệ VND / USD
export const formatCurrency = (amount, currency = 'VND', compact = false) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';

  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(2)} Tỷ`;
    }
    if (abs >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)} Tr`;
    }
    if (abs >= 1_000) {
      return `${(amount / 1_000).toFixed(1)} K`;
    }
  }

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

// Định dạng số lượng cổ phiếu
export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

// Định dạng phần trăm
export const formatPercent = (pct, withSign = true) => {
  if (pct === undefined || pct === null || isNaN(pct)) return '0.00%';
  const sign = withSign && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
};

// Tính tổng khối lượng còn lại của một mã
export const getRemainingQuantity = (lots = []) => {
  return lots.reduce((sum, lot) => sum + (Number(lot.remainingQty) || 0), 0);
};

// Tính tổng vốn đầu tư (Cost Basis) của số lượng còn lại
export const getTotalCostBasis = (lots = []) => {
  return lots.reduce((sum, lot) => {
    const remaining = Number(lot.remainingQty) || 0;
    if (remaining <= 0) return sum;
    // Tỷ lệ phí/thuế phân bổ theo lượng còn lại
    const origQty = Number(lot.quantity) || remaining;
    const feeRatio = origQty > 0 ? remaining / origQty : 1;
    const lotCost = (remaining * Number(lot.buyPrice)) + ((Number(lot.fee) || 0) + (Number(lot.tax) || 0)) * feeRatio;
    return sum + lotCost;
  }, 0);
};

// Tính Giá vốn bình quân (Weighted Average Cost - WAC)
export const getWeightedAvgPrice = (lots = []) => {
  const totalQty = getRemainingQuantity(lots);
  if (totalQty === 0) return 0;
  const totalCost = getTotalCostBasis(lots);
  return totalCost / totalQty;
};

// Tính Giá trị thị trường hiện tại của một mã
export const getMarketValue = (holding) => {
  const totalQty = getRemainingQuantity(holding.lots);
  return totalQty * (Number(holding.currentPrice) || 0);
};

// Tính Lãi/Lỗ tạm tính (Unrealized P&L) của một mã
export const getUnrealizedPnL = (holding) => {
  const marketVal = getMarketValue(holding);
  const costBasis = getTotalCostBasis(holding.lots);
  const pnl = marketVal - costBasis;
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  return { pnl, pnlPercent, marketVal, costBasis };
};

// Đánh giá hiệu suất và thông số của một lô đơn lẻ
export const getLotMetrics = (lot, currentPrice) => {
  const remaining = Number(lot.remainingQty) || 0;
  const buyPrice = Number(lot.buyPrice) || 0;
  const cost = remaining * buyPrice + (Number(lot.fee) || 0) + (Number(lot.tax) || 0);
  const currentVal = remaining * (currentPrice || buyPrice);
  const pnl = currentVal - cost;
  const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
  return {
    remaining,
    buyPrice,
    cost,
    currentVal,
    pnl,
    pnlPercent
  };
};

/**
 * ĐỘNG CƠ PHÂN BỔ LÔ BÁN DẦN (Gradual Selling Engine)
 * Hỗ trợ các phương pháp:
 * 1. 'FIFO' (First-In First-Out: Nhập trước xuất trước)
 * 2. 'LIFO' (Last-In First-Out: Nhập sau xuất trước)
 * 3. 'HIGHEST_COST' (Giá vốn cao nhất trước: Tối ưu phòng thủ / Chốt lỗ)
 * 4. 'LOWEST_COST' (Giá vốn thấp nhất trước: Tối ưu chốt lời)
 * 5. 'CUSTOM' (Nhà đầu tư tự chọn cụ thể số lượng từ từng lô)
 */
export const simulateSellAllocation = ({
  lots = [],
  sellQty = 0,
  sellPrice = 0,
  method = 'FIFO',
  customAllocations = {}, // { [lotId]: number }
  feeRate = 0.0015, // Phí giao dịch mặc định 0.15%
  taxRate = 0.001   // Thuế TNCN bán CK mặc định 0.1%
}) => {
  const activeLots = lots.filter(l => (Number(l.remainingQty) || 0) > 0);
  const totalAvailable = activeLots.reduce((s, l) => s + Number(l.remainingQty), 0);

  if (sellQty <= 0 || sellQty > totalAvailable) {
    return {
      isValid: false,
      error: `Khối lượng bán không hợp lệ (Khả dụng: ${formatNumber(totalAvailable)})`,
      allocatedLots: [],
      remainingLots: lots,
      totalRealizedPnL: 0,
      totalRealizedPnLPct: 0,
      grossProceeds: 0,
      totalFeeAndTax: 0,
      netProceeds: 0,
      newAvgPrice: getWeightedAvgPrice(lots),
      newTotalQty: totalAvailable
    };
  }

  let sortedLots = [...activeLots];

  if (method === 'FIFO') {
    // Sắp xếp ngày mua tăng dần (cũ nhất trước)
    sortedLots.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (method === 'LIFO') {
    // Sắp xếp ngày mua giảm dần (mới nhất trước)
    sortedLots.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (method === 'HIGHEST_COST') {
    // Sắp xếp giá vốn giảm dần
    sortedLots.sort((a, b) => Number(b.buyPrice) - Number(a.buyPrice));
  } else if (method === 'LOWEST_COST') {
    // Sắp xếp giá vốn tăng dần
    sortedLots.sort((a, b) => Number(a.buyPrice) - Number(b.buyPrice));
  }

  const allocatedLots = [];
  let remainingToSell = sellQty;
  const updatedLots = lots.map(l => ({ ...l }));

  if (method === 'CUSTOM') {
    // Phân bổ thủ công theo chỉ định của người dùng
    for (const lot of updatedLots) {
      const specifiedQty = Number(customAllocations[lot.id]) || 0;
      if (specifiedQty > 0) {
        const actualSold = Math.min(specifiedQty, Number(lot.remainingQty));
        const lotCostPerUnit = Number(lot.buyPrice);
        const buyCostOfSold = actualSold * lotCostPerUnit;
        const grossOfSold = actualSold * sellPrice;
        const lotFeeTax = grossOfSold * (feeRate + taxRate);
        const lotRealizedPnL = grossOfSold - lotFeeTax - buyCostOfSold;
        const lotRealizedPnLPct = buyCostOfSold > 0 ? (lotRealizedPnL / buyCostOfSold) * 100 : 0;

        allocatedLots.push({
          lotId: lot.id,
          lotDate: lot.date,
          lotNote: lot.note || '',
          buyPrice: lotCostPerUnit,
          qtySold: actualSold,
          lotRemainingBefore: Number(lot.remainingQty),
          lotRemainingAfter: Number(lot.remainingQty) - actualSold,
          buyCostOfSold,
          grossProceeds: grossOfSold,
          feeAndTax: lotFeeTax,
          realizedPnL: lotRealizedPnL,
          realizedPnLPct: lotRealizedPnLPct
        });

        lot.remainingQty = Number(lot.remainingQty) - actualSold;
      }
    }
  } else {
    // Phân bổ tự động theo thuật toán
    for (const lotRef of sortedLots) {
      if (remainingToSell <= 0) break;
      const targetLot = updatedLots.find(l => l.id === lotRef.id);
      if (!targetLot || targetLot.remainingQty <= 0) continue;

      const takeQty = Math.min(remainingToSell, targetLot.remainingQty);
      const lotCostPerUnit = Number(targetLot.buyPrice);
      const buyCostOfSold = takeQty * lotCostPerUnit;
      const grossOfSold = takeQty * sellPrice;
      const lotFeeTax = grossOfSold * (feeRate + taxRate);
      const lotRealizedPnL = grossOfSold - lotFeeTax - buyCostOfSold;
      const lotRealizedPnLPct = buyCostOfSold > 0 ? (lotRealizedPnL / buyCostOfSold) * 100 : 0;

      allocatedLots.push({
        lotId: targetLot.id,
        lotDate: targetLot.date,
        lotNote: targetLot.note || '',
        buyPrice: lotCostPerUnit,
        qtySold: takeQty,
        lotRemainingBefore: Number(targetLot.remainingQty),
        lotRemainingAfter: Number(targetLot.remainingQty) - takeQty,
        buyCostOfSold,
        grossProceeds: grossOfSold,
        feeAndTax: lotFeeTax,
        realizedPnL: lotRealizedPnL,
        realizedPnLPct: lotRealizedPnLPct
      });

      targetLot.remainingQty -= takeQty;
      remainingToSell -= takeQty;
    }
  }

  const grossProceeds = sellQty * sellPrice;
  const totalFeeAndTax = grossProceeds * (feeRate + taxRate);
  const netProceeds = grossProceeds - totalFeeAndTax;
  const totalBuyCost = allocatedLots.reduce((sum, item) => sum + item.buyCostOfSold, 0);
  const totalRealizedPnL = netProceeds - totalBuyCost;
  const totalRealizedPnLPct = totalBuyCost > 0 ? (totalRealizedPnL / totalBuyCost) * 100 : 0;

  const newTotalQty = getRemainingQuantity(updatedLots);
  const newAvgPrice = getWeightedAvgPrice(updatedLots);
  const newTotalCost = getTotalCostBasis(updatedLots);
  const remainingMarketVal = newTotalQty * sellPrice;
  const remainingPnL = remainingMarketVal - newTotalCost;
  const remainingPnLPct = newTotalCost > 0 ? (remainingPnL / newTotalCost) * 100 : 0;

  return {
    isValid: true,
    allocatedLots,
    remainingLots: updatedLots,
    grossProceeds,
    totalFeeAndTax,
    netProceeds,
    totalBuyCost,
    totalRealizedPnL,
    totalRealizedPnLPct,
    newTotalQty,
    newAvgPrice,
    newTotalCost,
    remainingMarketVal,
    remainingPnL,
    remainingPnLPct
  };
};

// Tổng hợp toàn bộ danh mục tài sản
export const aggregatePortfolio = (holdings = [], cashBalance = 0, realizedTrades = []) => {
  let totalInvestedCost = 0;
  let totalCurrentMarketValue = 0;
  let totalDailyGainAmount = 0;

  holdings.forEach(h => {
    const qty = getRemainingQuantity(h.lots);
    if (qty > 0) {
      const costBasis = getTotalCostBasis(h.lots);
      const mktVal = qty * (Number(h.currentPrice) || 0);
      totalInvestedCost += costBasis;
      totalCurrentMarketValue += mktVal;

      // Ước lượng biến động trong ngày (dựa trên dailyChange %)
      const dailyChangeRate = (Number(h.dailyChange) || 0) / 100;
      const prevVal = mktVal / (1 + dailyChangeRate);
      totalDailyGainAmount += (mktVal - prevVal);
    }
  });

  const totalNetWorth = totalCurrentMarketValue + Number(cashBalance || 0);
  const totalUnrealizedPnL = totalCurrentMarketValue - totalInvestedCost;
  const totalUnrealizedPnLPercent = totalInvestedCost > 0 ? (totalUnrealizedPnL / totalInvestedCost) * 100 : 0;

  // Lãi/lỗ đã thực hiện từ các lệnh bán đã chốt
  const totalRealizedPnL = realizedTrades.reduce((sum, t) => sum + (Number(t.realizedPnL) || 0), 0);
  const winningTrades = realizedTrades.filter(t => (Number(t.realizedPnL) || 0) > 0).length;
  const winRate = realizedTrades.length > 0 ? (winningTrades / realizedTrades.length) * 100 : 0;

  const totalDailyGainPercent = (totalCurrentMarketValue - totalDailyGainAmount) > 0
    ? (totalDailyGainAmount / (totalCurrentMarketValue - totalDailyGainAmount)) * 100
    : 0;

  return {
    totalNetWorth,
    totalInvestedCost,
    totalCurrentMarketValue,
    cashBalance: Number(cashBalance || 0),
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    totalRealizedPnL,
    totalTradesCount: realizedTrades.length,
    winRate,
    totalDailyGainAmount,
    totalDailyGainPercent
  };
};
