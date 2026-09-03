/**
 * LocalStorage & Multi-Account Data Manager (Bulletproof Persistence)
 * Phân tách 100% dữ liệu danh mục đầu tư theo từng tài khoản Gmail / User ID
 */

import { INITIAL_HOLDINGS, INITIAL_CASH, INITIAL_REALIZED_TRADES } from './mockData';

const BASE_MASTER_KEY = 'investpro_master_db';
const LEGACY_MASTER_KEY = 'investpro_master_db_v2';

// Tạo khóa lưu trữ riêng cho từng user
export const getUserDbKey = (userId = 'guest_user') => {
  const cleanId = (userId || 'guest_user').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${BASE_MASTER_KEY}_${cleanId}`;
};

/**
 * Đọc dữ liệu danh mục của 1 tài khoản cụ thể
 */
export const loadPortfolioData = (userId = 'guest_user') => {
  try {
    const userKey = getUserDbKey(userId);
    const raw = localStorage.getItem(userKey);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
          cashBalance: typeof parsed.cashBalance === 'number' ? parsed.cashBalance : 0,
          realizedTrades: Array.isArray(parsed.realizedTrades) ? parsed.realizedTrades : []
        };
      }
    }

    // Nếu là tài khoản Khách / Mặc định, thử đọc từ Master DB cũ trước khi nạp sample
    if (userId === 'guest_user') {
      const legacyRaw = localStorage.getItem(LEGACY_MASTER_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (legacyParsed && typeof legacyParsed === 'object') {
          return {
            holdings: Array.isArray(legacyParsed.holdings) ? legacyParsed.holdings : [],
            cashBalance: typeof legacyParsed.cashBalance === 'number' ? legacyParsed.cashBalance : INITIAL_CASH,
            realizedTrades: Array.isArray(legacyParsed.realizedTrades) ? legacyParsed.realizedTrades : []
          };
        }
      }

      // Khởi tạo dữ liệu mẫu cho tài khoản khách lần đầu
      return {
        holdings: INITIAL_HOLDINGS,
        cashBalance: INITIAL_CASH,
        realizedTrades: INITIAL_REALIZED_TRADES
      };
    }

    // Tài khoản mới đăng nhập lần đầu tiên -> Bắt đầu với danh mục trống sạch sẽ
    return {
      holdings: [],
      cashBalance: 0,
      realizedTrades: []
    };
  } catch (error) {
    console.error(`Lỗi khi đọc dữ liệu của user [${userId}]:`, error);
    return {
      holdings: [],
      cashBalance: 0,
      realizedTrades: []
    };
  }
};

/**
 * Lưu dữ liệu của 1 tài khoản cụ thể
 */
export const savePortfolioData = ({ holdings, cashBalance, realizedTrades }, userId = 'guest_user') => {
  try {
    const cleanHoldings = Array.isArray(holdings) ? holdings : [];
    const cleanCash = typeof cashBalance === 'number' ? cashBalance : Number(cashBalance) || 0;
    const cleanTrades = Array.isArray(realizedTrades) ? realizedTrades : [];

    const payload = {
      userId,
      holdings: cleanHoldings,
      cashBalance: cleanCash,
      realizedTrades: cleanTrades,
      lastSaved: new Date().toISOString(),
      version: '3.0'
    };

    const userKey = getUserDbKey(userId);
    localStorage.setItem(userKey, JSON.stringify(payload));

    // Nếu là guest, đồng bộ thêm vào key legacy để tương thích
    if (userId === 'guest_user') {
      localStorage.setItem(LEGACY_MASTER_KEY, JSON.stringify(payload));
    }

    return true;
  } catch (error) {
    console.error(`Lỗi nghiêm trọng khi lưu dữ liệu của user [${userId}]:`, error);
    return false;
  }
};

/**
 * Khôi phục lại dữ liệu mẫu cho 1 user
 */
export const resetToSampleData = (userId = 'guest_user') => {
  try {
    const sample = {
      holdings: INITIAL_HOLDINGS,
      cashBalance: INITIAL_CASH,
      realizedTrades: INITIAL_REALIZED_TRADES
    };
    savePortfolioData(sample, userId);
    return sample;
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu mẫu:', error);
    return null;
  }
};

/**
 * Sao chép dữ liệu từ tài khoản này sang tài khoản khác
 */
export const copyPortfolioData = (fromUserId, toUserId) => {
  try {
    const data = loadPortfolioData(fromUserId);
    savePortfolioData(data, toUserId);
    return data;
  } catch (err) {
    console.error('Lỗi sao chép dữ liệu:', err);
    return null;
  }
};

/**
 * Xuất file sao lưu JSON theo từng tài khoản
 */
export const exportPortfolioJSON = (data, userEmail = 'user') => {
  const exportPayload = {
    appName: 'InvestPro Portfolio Tracker',
    account: userEmail,
    version: '3.0',
    exportedAt: new Date().toISOString(),
    ...data
  };

  const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `investpro-${safeEmail}-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
