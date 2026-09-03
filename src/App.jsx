import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PortfolioSummary } from './components/PortfolioSummary';
import { HoldingsTable } from './components/HoldingsTable';
import { PortfolioCharts } from './components/PortfolioCharts';
import { RealizedPnLHistory } from './components/RealizedPnLHistory';
import { FinancialAdvisor } from './components/FinancialAdvisor';
import { BuyOrderModal } from './components/BuyOrderModal';
import { SellOrderModal } from './components/SellOrderModal';
import { LotDetailsModal } from './components/LotDetailsModal';
import { CashFlowModal } from './components/CashFlowModal';
import { ResetPortfolioModal } from './components/ResetPortfolioModal';
import { EditHoldingModal } from './components/EditHoldingModal';
import { QuickPriceUpdaterModal } from './components/QuickPriceUpdaterModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';

import { 
  loadPortfolioData, 
  savePortfolioData, 
  resetToSampleData, 
  exportPortfolioJSON 
} from './utils/storage';

import { aggregatePortfolio } from './utils/finance';
import { fetchLivePricesFromApi, getApiSettings } from './services/marketPriceService';

export const App = () => {
  // Load saved state or mock data
  const [data, setData] = useState(() => loadPortfolioData());
  const { holdings, cashBalance, realizedTrades } = data;

  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'history' | 'advisor'

  // Live Price Sync State
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [apiSource, setApiSource] = useState('VNDIRECT / DNSE');
  const [autoSyncInterval, setAutoSyncInterval] = useState(0); // 0 = Tắt tự động, hoàn toàn thủ công

  // Modals state
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyPrefilledHolding, setBuyPrefilledHolding] = useState(null);

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellSelectedHolding, setSellSelectedHolding] = useState(null);
  const [sellSelectedLotId, setSellSelectedLotId] = useState(null);

  const [lotDetailsModalOpen, setLotDetailsModalOpen] = useState(false);
  const [lotDetailsSelectedHolding, setLotDetailsSelectedHolding] = useState(null);

  const [editHoldingModalOpen, setEditHoldingModalOpen] = useState(false);
  const [editSelectedHolding, setEditSelectedHolding] = useState(null);

  const [quickPriceModalOpen, setQuickPriceModalOpen] = useState(false);
  const [apiSettingsModalOpen, setApiSettingsModalOpen] = useState(false);

  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState('');

  // Auto-save whenever holdings, cash or trades change
  useEffect(() => {
    savePortfolioData({ holdings, cashBalance, realizedTrades });
    setLastSaved(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [holdings, cashBalance, realizedTrades]);

  // Live Price Sync Handler (Chỉ chạy khi người dùng chủ động bấm)
  const handleSyncLivePrices = async () => {
    if (holdings.length === 0 || isSyncingPrices) return;
    setIsSyncingPrices(true);
    try {
      const { updatedPrices, successCount, timestamp, source } = await fetchLivePricesFromApi(holdings);
      if (successCount > 0) {
        setData(prev => {
          const newHoldings = prev.holdings.map(h => {
            if (updatedPrices[h.id]) {
              return {
                ...h,
                currentPrice: updatedPrices[h.id].price,
                dailyChange: updatedPrices[h.id].dailyChange
              };
            }
            return h;
          });
          return {
            ...prev,
            holdings: newHoldings
          };
        });
        setLastSyncTime(timestamp);
        setApiSource(source);
        alert(`Đã cập nhật thành công giá của ${successCount} mã từ ${source}!`);
      } else {
        alert('Không kết nối được API bảng giá hoặc phiên giao dịch đóng cửa. Bạn có thể sửa trực tiếp giá từng mã trên bảng.');
      }
    } catch (error) {
      console.error('Lỗi khi đồng bộ giá từ API:', error);
      alert('Không thể kết nối API giá sàn. Hãy nhập giá thủ công trên bảng.');
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Recurring Auto-Sync Timer
  useEffect(() => {
    if (autoSyncInterval <= 0) return;
    const intervalId = setInterval(() => {
      handleSyncLivePrices();
    }, autoSyncInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoSyncInterval, holdings]);

  // Aggregate metrics
  const portfolioMetrics = aggregatePortfolio(holdings, cashBalance, realizedTrades);

  // 1. Handlers for Buy Order
  const handleOpenBuy = (holding = null) => {
    setBuyPrefilledHolding(holding);
    setBuyModalOpen(true);
  };

  const handleConfirmBuy = ({ symbol, name, exchange, sector, assetClass, currentPrice, lot, totalCost }) => {
    setData(prev => {
      const existingIdx = prev.holdings.findIndex(h => h.symbol.toUpperCase() === symbol.toUpperCase());
      let updatedHoldings = [...prev.holdings];

      if (existingIdx >= 0) {
        // Cổ phiếu đã tồn tại -> Thêm lô mới vào
        const existingHolding = updatedHoldings[existingIdx];
        const updatedLots = [...existingHolding.lots, lot];
        updatedHoldings[existingIdx] = {
          ...existingHolding,
          currentPrice: currentPrice || existingHolding.currentPrice,
          lots: updatedLots
        };
      } else {
        // Cổ phiếu mới -> Tạo holding mới
        const newHolding = {
          id: `holding-${symbol.toLowerCase()}-${Date.now()}`,
          symbol,
          name: name || symbol,
          exchange: exchange || 'HOSE',
          sector: sector || 'Khác',
          assetClass: assetClass || 'stock',
          currentPrice: currentPrice || lot.buyPrice,
          dailyChange: 0,
          lots: [lot]
        };
        updatedHoldings.push(newHolding);
      }

      // Trừ tiền mặt khả dụng
      const updatedCash = Math.max(0, prev.cashBalance - totalCost);

      return {
        ...prev,
        holdings: updatedHoldings,
        cashBalance: updatedCash
      };
    });
  };

  // 2. Handlers for Sell Order (Bán dần từng lô)
  const handleOpenSell = (holding, lotId = null) => {
    setSellSelectedHolding(holding);
    setSellSelectedLotId(lotId);
    setSellModalOpen(true);
  };

  const handleConfirmSell = ({ holdingId, symbol, sellQty, sellPrice, sellDate, method, note, simulation }) => {
    setData(prev => {
      const holdingIdx = prev.holdings.findIndex(h => h.id === holdingId);
      if (holdingIdx === -1) return prev;

      const updatedHoldings = [...prev.holdings];
      const targetHolding = updatedHoldings[holdingIdx];

      // Cập nhật lại các lô còn lại theo kết quả phân bổ của simulation
      updatedHoldings[holdingIdx] = {
        ...targetHolding,
        currentPrice: sellPrice || targetHolding.currentPrice,
        lots: simulation.remainingLots
      };

      // Tạo bản ghi giao dịch chốt lời/cắt lỗ
      const newTradeRecord = {
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        symbol,
        sellDate,
        sellPrice,
        sellQty,
        method,
        grossProceeds: simulation.grossProceeds,
        totalFeeAndTax: simulation.totalFeeAndTax,
        netProceeds: simulation.netProceeds,
        totalBuyCost: simulation.totalBuyCost,
        realizedPnL: simulation.totalRealizedPnL,
        realizedPnLPct: simulation.totalRealizedPnLPct,
        note,
        lotBreakdowns: simulation.allocatedLots
      };

      // Cộng tiền thu về vào tiền mặt khả dụng
      const updatedCash = prev.cashBalance + simulation.netProceeds;
      const updatedTrades = [newTradeRecord, ...prev.realizedTrades];

      return {
        ...prev,
        holdings: updatedHoldings,
        cashBalance: updatedCash,
        realizedTrades: updatedTrades
      };
    });
  };

  // 3. Handlers for Lot Details Modal
  const handleOpenLotDetails = (holding) => {
    setLotDetailsSelectedHolding(holding);
    setLotDetailsModalOpen(true);
  };

  // 4. Handlers for Cash Balance
  const handleUpdateCash = (newBalance) => {
    setData(prev => ({
      ...prev,
      cashBalance: newBalance
    }));
  };

  // 5. Handlers for Price Updates (Single stock or Batch)
  const handleUpdateHoldingPrice = (holdingId, newPrice) => {
    setData(prev => {
      const updatedHoldings = prev.holdings.map(h => {
        if (h.id === holdingId) {
          const deltaPct = h.currentPrice > 0 ? ((newPrice - h.currentPrice) / h.currentPrice) * 100 : 0;
          return {
            ...h,
            currentPrice: newPrice,
            dailyChange: deltaPct
          };
        }
        return h;
      });
      return {
        ...prev,
        holdings: updatedHoldings
      };
    });
  };

  // 6. Delete a specific Lot
  const handleDeleteLot = (holdingId, lotId) => {
    setData(prev => {
      const updatedHoldings = prev.holdings.map(h => {
        if (h.id === holdingId) {
          const remainingLots = h.lots.filter(l => l.id !== lotId);
          return {
            ...h,
            lots: remainingLots
          };
        }
        return h;
      }).filter(h => h.lots.length > 0); // Tự động dọn dẹp nếu mã không còn lô nào

      return {
        ...prev,
        holdings: updatedHoldings
      };
    });
  };

  // 7. Save edited holding (symbol, name, exchange, sector, currentPrice, lots)
  const handleSaveHolding = (updatedHolding) => {
    setData(prev => ({
      ...prev,
      holdings: prev.holdings.map(h => h.id === updatedHolding.id ? updatedHolding : h)
    }));
  };

  // 8. Batch update market prices from QuickPriceUpdaterModal
  const handleSaveBatchPrices = (pricesMap) => {
    setData(prev => ({
      ...prev,
      holdings: prev.holdings.map(h => {
        if (pricesMap[h.id] !== undefined) {
          return {
            ...h,
            currentPrice: pricesMap[h.id]
          };
        }
        return h;
      })
    }));
  };

  // 9. Clear all holdings to start fresh
  const handleConfirmClearAll = ({ initialCash, clearHistory }) => {
    setData(prev => ({
      holdings: [],
      cashBalance: initialCash,
      realizedTrades: clearHistory ? [] : prev.realizedTrades
    }));
  };

  // 10. Reset to Sample
  const handleResetData = () => {
    const sample = resetToSampleData();
    if (sample) setData(sample);
  };

  // 11. Export JSON
  const handleExport = () => {
    exportPortfolioJSON({
      holdings,
      cashBalance,
      realizedTrades
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        cashBalance={cashBalance}
        onOpenBuyModal={() => handleOpenBuy(null)}
        onOpenCashModal={() => setCashModalOpen(true)}
        onExport={handleExport}
        onReset={handleResetData}
        onClearAll={() => setResetModalOpen(true)}
        onOpenApiSettings={() => setApiSettingsModalOpen(true)}
        lastSaved={lastSaved}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Portfolio Summary Cards */}
        <PortfolioSummary metrics={portfolioMetrics} />

        {/* Dynamic Tab Views */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Visual Charts & Portfolio Allocation Dashboard */}
            <PortfolioCharts holdings={holdings} cashBalance={cashBalance} />

            {/* Holdings Table with Lot Pills and Expandable Drawer */}
            <HoldingsTable
              holdings={holdings}
              onOpenBuyModal={handleOpenBuy}
              onOpenSellModal={handleOpenSell}
              onOpenLotDetails={handleOpenLotDetails}
              onOpenEditHolding={(h) => {
                setEditSelectedHolding(h);
                setEditHoldingModalOpen(true);
              }}
              onOpenQuickPriceUpdater={() => setQuickPriceModalOpen(true)}
              onOpenApiSettings={() => setApiSettingsModalOpen(true)}
              onDeleteHolding={(id) => {
                setData(prev => ({
                  ...prev,
                  holdings: prev.holdings.filter(h => h.id !== id)
                }));
              }}
              onUpdateHoldingPrice={handleUpdateHoldingPrice}
              onDeleteLot={handleDeleteLot}
              onSyncLivePrices={handleSyncLivePrices}
              isSyncingPrices={isSyncingPrices}
              lastSyncTime={lastSyncTime}
              apiSource={apiSource}
              autoSyncInterval={autoSyncInterval}
              onChangeAutoSyncInterval={setAutoSyncInterval}
              onOpenResetModal={() => setResetModalOpen(true)}
              onResetSampleData={handleResetData}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <RealizedPnLHistory realizedTrades={realizedTrades} />
        )}

        {activeTab === 'advisor' && (
          <FinancialAdvisor
            holdings={holdings}
            cashBalance={cashBalance}
            onOpenSellModal={handleOpenSell}
            onOpenBuyModal={handleOpenBuy}
          />
        )}

      </main>

      {/* Modals */}
      {buyModalOpen && (
        <BuyOrderModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          prefilledHolding={buyPrefilledHolding}
          existingHoldings={holdings}
          cashBalance={cashBalance}
          onConfirmBuy={handleConfirmBuy}
        />
      )}

      {sellModalOpen && sellSelectedHolding && (
        <SellOrderModal
          isOpen={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSellSelectedLotId(null);
          }}
          holding={sellSelectedHolding}
          preselectedLotId={sellSelectedLotId}
          onConfirmSell={handleConfirmSell}
        />
      )}

      {lotDetailsModalOpen && lotDetailsSelectedHolding && (
        <LotDetailsModal
          isOpen={lotDetailsModalOpen}
          onClose={() => setLotDetailsModalOpen(false)}
          holding={lotDetailsSelectedHolding}
          onOpenSellModal={handleOpenSell}
          onOpenBuyModal={handleOpenBuy}
        />
      )}

      {editHoldingModalOpen && editSelectedHolding && (
        <EditHoldingModal
          isOpen={editHoldingModalOpen}
          onClose={() => {
            setEditHoldingModalOpen(false);
            setEditSelectedHolding(null);
          }}
          holding={editSelectedHolding}
          onSaveHolding={handleSaveHolding}
        />
      )}

      {quickPriceModalOpen && (
        <QuickPriceUpdaterModal
          isOpen={quickPriceModalOpen}
          onClose={() => setQuickPriceModalOpen(false)}
          holdings={holdings}
          onSaveBatchPrices={handleSaveBatchPrices}
        />
      )}

      {apiSettingsModalOpen && (
        <ApiSettingsModal
          isOpen={apiSettingsModalOpen}
          onClose={() => setApiSettingsModalOpen(false)}
          onSaveSettings={(newSettings) => {
            setApiSource(newSettings.primarySource);
          }}
        />
      )}

      {cashModalOpen && (
        <CashFlowModal
          isOpen={cashModalOpen}
          onClose={() => setCashModalOpen(false)}
          currentCash={cashBalance}
          onUpdateCash={handleUpdateCash}
        />
      )}

      {resetModalOpen && (
        <ResetPortfolioModal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          currentCash={cashBalance}
          holdingsCount={holdings.length}
          tradesCount={realizedTrades.length}
          onConfirmClearAll={handleConfirmClearAll}
          onResetSampleData={handleResetData}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>InvestPro © 2024 - Hệ Thống Quản Lý Danh Mục Đầu Tư & Phân Bổ Lô Mua Bán Dần (Tax-Lot System)</span>
          <span className="text-slate-400">Được tối ưu cho thị trường chứng khoán Việt Nam (HOSE / HNX / UPCOM) & Toàn cầu</span>
        </div>
      </footer>

    </div>
  );
};
