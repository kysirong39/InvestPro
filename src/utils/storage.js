/**
 * LocalStorage & Data Import/Export Manager (Bulletproof Persistence)
 * Đảm bảo 100% dữ liệu được lưu vĩnh viễn trên trình duyệt của người dùng.
 */

import { INITIAL_HOLDINGS, INITIAL_CASH, INITIAL_REALIZED_TRADES } from './mockData';

const MASTER_DB_KEY = 'investpro_master_db_v2';
const LEGACY_KEYS = {
  HOLDINGS: 'investpro_holdings_v1',
  CASH: 'investpro_cash_v1',
  TRADES: 'investpro_trades_v1',
  INITIALIZED: 'investpro_is_initialized_v2'
};

/**
 * Đọc dữ liệu danh mục từ LocalStorage
 */
export const loadPortfolioData = () => {
  try {
    // 1. Thử đọc từ Master DB trước
    const masterRaw = localStorage.getItem(MASTER_DB_KEY);
    if (masterRaw) {
      const parsed = JSON.parse(masterRaw);
      if (parsed && typeof parsed === 'object') {
        return {
          holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
          cashBalance: typeof parsed.cashBalance === 'number' ? parsed.cashBalance : INITIAL_CASH,
          realizedTrades: Array.isArray(parsed.realizedTrades) ? parsed.realizedTrades : []
        };
      }
    }

    // 2. Thử đọc từ Legacy Keys
    const savedHoldings = localStorage.getItem(LEGACY_KEYS.HOLDINGS);
    const savedCash = localStorage.getItem(LEGACY_KEYS.CASH);
    const savedTrades = localStorage.getItem(LEGACY_KEYS.TRADES);
    const isInit = localStorage.getItem(LEGACY_KEYS.INITIALIZED);

    // Nếu người dùng đã từng thao tác (kể cả xóa trắng danh mục)
    if (isInit === 'true' || savedHoldings !== null) {
      return {
        holdings: savedHoldings ? JSON.parse(savedHoldings) : [],
        cashBalance: savedCash !== null ? Number(savedCash) : INITIAL_CASH,
        realizedTrades: savedTrades ? JSON.parse(savedTrades) : []
      };
    }

    // 3. Lần đầu tiên mở app trên trình duyệt mới tinh -> nạp dữ liệu mẫu
    return {
      holdings: INITIAL_HOLDINGS,
      cashBalance: INITIAL_CASH,
      realizedTrades: INITIAL_REALIZED_TRADES
    };
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu từ LocalStorage:', error);
    return {
      holdings: INITIAL_HOLDINGS,
      cashBalance: INITIAL_CASH,
      realizedTrades: INITIAL_REALIZED_TRADES
    };
  }
};

/**
 * Lưu tức thì dữ liệu vào LocalStorage (ghi cả Master DB và Legacy Keys)
 */
export const savePortfolioData = ({ holdings, cashBalance, realizedTrades }) => {
  try {
    const cleanHoldings = Array.isArray(holdings) ? holdings : [];
    const cleanCash = typeof cashBalance === 'number' ? cashBalance : Number(cashBalance) || 0;
    const cleanTrades = Array.isArray(realizedTrades) ? realizedTrades : [];

    const payload = {
      holdings: cleanHoldings,
      cashBalance: cleanCash,
      realizedTrades: cleanTrades,
      lastSaved: new Date().toISOString(),
      version: '2.0'
    };

    // Ghi vào Master DB
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(payload));

    // Ghi vào Legacy Keys để đảm bảo tương thích
    localStorage.setItem(LEGACY_KEYS.HOLDINGS, JSON.stringify(cleanHoldings));
    localStorage.setItem(LEGACY_KEYS.CASH, String(cleanCash));
    localStorage.setItem(LEGACY_KEYS.TRADES, JSON.stringify(cleanTrades));
    localStorage.setItem(LEGACY_KEYS.INITIALIZED, 'true');

    return true;
  } catch (error) {
    console.error('Lỗi nghiêm trọng khi lưu dữ liệu vào LocalStorage:', error);
    return false;
  }
};

/**
 * Khôi phục lại dữ liệu mẫu
 */
export const resetToSampleData = () => {
  try {
    const sample = {
      holdings: INITIAL_HOLDINGS,
      cashBalance: INITIAL_CASH,
      realizedTrades: INITIAL_REALIZED_TRADES
    };
    savePortfolioData(sample);
    return sample;
  } catch (error) {
    console.error('Lỗi khi khôi phục dữ liệu mẫu:', error);
    return null;
  }
};

/**
 * Xuất file sao lưu JSON
 */
export const exportPortfolioJSON = (data) => {
  const exportPayload = {
    appName: 'InvestPro Portfolio Tracker',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    ...data
  };

  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `investpro-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
