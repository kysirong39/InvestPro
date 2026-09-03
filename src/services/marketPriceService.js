/**
 * Live Market Price Service for Vietnamese & Global Assets
 * Tự động & Thủ công cập nhật giá từ các nguồn API chứng khoán uy tín:
 * - DNSE / Entrade Open Market Chart API (Chuẩn CORS 100%, độ ổn định cao)
 * - VNDIRECT Finfo API v4 (Dữ liệu khớp lệnh chính thức)
 * - TCBS Public Market API
 * - Binance Public API (Crypto USDT)
 * - Custom Endpoint API URL do người dùng tự cấu hình
 */

export const DEFAULT_API_SETTINGS = {
  primarySource: 'DNSE',     // 'DNSE' (khuyến nghị vì CORS mở 100%) | 'VNDIRECT' | 'BINANCE' | 'CUSTOM'
  enableFallback: true,      // Tự động chuyển nguồn dự phòng nếu nguồn chính lỗi
  customEndpointUrl: '',     // Endpoint API tùy chỉnh
  autoSyncOnLoad: false,     // Tự động lấy giá khi mở ứng dụng
  timeoutMs: 6000            // Timeout mỗi request (6s)
};

export const getApiSettings = () => {
  try {
    const saved = localStorage.getItem('investpro_api_settings');
    if (saved) return { ...DEFAULT_API_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {
    console.warn('Lỗi đọc cấu hình API từ localStorage:', e);
  }
  return DEFAULT_API_SETTINGS;
};

export const saveApiSettings = (settings) => {
  try {
    localStorage.setItem('investpro_api_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Lỗi lưu cấu hình API:', e);
  }
};

/**
 * Kiểm tra kết nối tới một nguồn API cụ thể
 */
export const testApiConnection = async (source = 'DNSE', customUrl = '') => {
  const startTime = performance.now();
  const testSymbol = 'FPT';

  try {
    // 1. DNSE / ENTRADE (Khuyến nghị số 1 vì mở CORS hoàn toàn cho trình duyệt)
    if (source === 'DNSE') {
      const toTime = Math.floor(Date.now() / 1000);
      const fromTime = toTime - (86400 * 30); // Lấy 30 ngày gần nhất để đảm bảo luôn có nến khớp lệnh
      const url = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromTime}&to=${toTime}&symbol=${testSymbol}&resolution=1D`;
      
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        const data = await res.json();
        if (data && data.c && Array.isArray(data.c) && data.c.length > 0) {
          const lastClose = data.c[data.c.length - 1];
          const price = Math.round(lastClose * 1000);
          return {
            success: true,
            latency,
            sampleSymbol: testSymbol,
            samplePrice: price,
            message: `Kết nối DNSE thành công! Giá FPT: ${price.toLocaleString('vi-VN')} ₫ (${latency}ms)`
          };
        }
      }
      throw new Error(`DNSE trả về dữ liệu rỗng hoặc sai cấu trúc`);
    }

    // 2. VNDIRECT (Finfo API v4)
    if (source === 'VNDIRECT') {
      const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:${testSymbol}&sort=date:desc&size=5`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
          const item = json.data[0];
          const price = Math.round((Number(item.close) || Number(item.basicPrice) || 0) * 1000);
          return {
            success: true,
            latency,
            sampleSymbol: testSymbol,
            samplePrice: price,
            message: `Kết nối VNDIRECT thành công! Giá FPT: ${price.toLocaleString('vi-VN')} ₫ (${latency}ms)`
          };
        }
      }
      throw new Error(`Trình duyệt có thể bị chặn CORS bởi VNDIRECT (Mã lỗi: ${res.status || 'Network Error'}). Hệ thống sẽ tự động dùng DNSE làm nguồn dự phòng.`);
    }

    // 3. BINANCE
    if (source === 'BINANCE') {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        const data = await res.json();
        const price = Number(data.lastPrice) || 0;
        return {
          success: true,
          latency,
          sampleSymbol: 'BTC',
          samplePrice: price,
          message: `Kết nối Binance thành công! Giá BTC: $${price.toLocaleString()} (${latency}ms)`
        };
      }
      throw new Error(`Binance phản hồi lỗi HTTP ${res.status}`);
    }

    // 4. CUSTOM URL
    if (source === 'CUSTOM') {
      if (!customUrl) throw new Error('Vui lòng nhập đường dẫn Custom Endpoint API URL');
      const res = await fetch(customUrl, { signal: AbortSignal.timeout(6000) });
      const latency = Math.round(performance.now() - startTime);
      return {
        success: res.ok,
        latency,
        sampleSymbol: 'CUSTOM',
        samplePrice: 0,
        message: res.ok ? `Custom API phản hồi tốt (${latency}ms)` : `Lỗi HTTP ${res.status}`
      };
    }

    throw new Error('Nguồn API không được hỗ trợ');
  } catch (err) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      latency,
      sampleSymbol: testSymbol,
      samplePrice: 0,
      message: `Lỗi kết nối: ${err.message || 'Bị chặn CORS hoặc timeout mạng'}.`
    };
  }
};

/**
 * Lấy giá thị trường cho toàn bộ danh mục holdings theo cấu hình API
 */
export const fetchLivePricesFromApi = async (holdings = [], customSettings = null) => {
  if (!holdings || holdings.length === 0) return { updatedPrices: {}, successCount: 0, source: 'NONE' };

  const settings = customSettings || getApiSettings();
  const results = {};
  const vnSymbols = [];
  const cryptoSymbols = [];

  holdings.forEach(h => {
    const sym = h.symbol.toUpperCase().trim();
    if (sym === 'BTC' || sym === 'ETH' || sym === 'SOL' || sym === 'BNB' || h.assetClass === 'crypto') {
      cryptoSymbols.push({ id: h.id, symbol: sym });
    } else {
      vnSymbols.push({ id: h.id, symbol: sym });
    }
  });

  let successCount = 0;
  let usedSource = settings.primarySource || 'DNSE';

  // 1. Thử lấy qua DNSE trước (hoặc theo cấu hình) vì DNSE mở CORS 100% cho mọi trình duyệt
  if (vnSymbols.length > 0) {
    // Luồng DNSE
    if (settings.primarySource === 'DNSE' || settings.enableFallback) {
      await Promise.all(
        vnSymbols.map(async (s) => {
          try {
            const toTime = Math.floor(Date.now() / 1000);
            const fromTime = toTime - (86400 * 30);
            const url = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromTime}&to=${toTime}&symbol=${s.symbol}&resolution=1D`;
            const res = await fetch(url, { signal: AbortSignal.timeout(settings.timeoutMs || 6000) });
            if (res.ok) {
              const data = await res.json();
              if (data && data.c && Array.isArray(data.c) && data.c.length > 0) {
                const lastClose = data.c[data.c.length - 1];
                const prevClose = data.c.length > 1 ? data.c[data.c.length - 2] : lastClose;
                const priceInVnd = Math.round(lastClose * 1000);
                const pctChange = prevClose > 0 ? ((lastClose - prevClose) / prevClose) * 100 : 0;
                results[s.id] = {
                  price: priceInVnd,
                  dailyChange: Number(pctChange.toFixed(2))
                };
                successCount++;
                usedSource = 'DNSE / Entrade (Khớp lệnh)';
              }
            }
          } catch (e) {
            // Sẽ fallback sang VNDirect nếu DNSE lỗi
          }
        })
      );
    }

    // Luồng VNDIRECT (nếu còn mã chưa có giá)
    const unhandledVn = vnSymbols.filter(s => !results[s.id]);
    if (unhandledVn.length > 0 && (settings.primarySource === 'VNDIRECT' || settings.enableFallback)) {
      try {
        const symbolQuery = unhandledVn.map(s => s.symbol).join(',');
        const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:${symbolQuery}&sort=date:desc&size=${unhandledVn.length * 3}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(settings.timeoutMs || 6000) });
        if (res.ok) {
          const json = await res.json();
          if (json && json.data && Array.isArray(json.data)) {
            const latestMap = {};
            json.data.forEach(item => {
              const code = item.code.toUpperCase();
              if (!latestMap[code]) {
                const closePrice = Number(item.close) || Number(item.basicPrice) || 0;
                const pctChange = Number(item.pctChange) || 0;
                if (closePrice > 0) {
                  latestMap[code] = {
                    price: Math.round(closePrice * 1000),
                    dailyChange: Number(pctChange.toFixed(2))
                  };
                }
              }
            });

            unhandledVn.forEach(s => {
              if (latestMap[s.symbol]) {
                results[s.id] = latestMap[s.symbol];
                successCount++;
                usedSource = 'VNDIRECT Finfo';
              }
            });
          }
        }
      } catch (err) {
        console.warn('VNDirect CORS/Network warning:', err);
      }
    }
  }

  // 2. Fetch Crypto via Binance API
  if (cryptoSymbols.length > 0) {
    await Promise.all(
      cryptoSymbols.map(async (c) => {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${c.symbol}USDT`, {
            signal: AbortSignal.timeout(settings.timeoutMs || 6000)
          });
          if (res.ok) {
            const data = await res.json();
            const lastPrice = Number(data.lastPrice) || 0;
            const pct = Number(data.priceChangePercent) || 0;
            if (lastPrice > 0) {
              results[c.id] = {
                price: lastPrice,
                dailyChange: Number(pct.toFixed(2))
              };
              successCount++;
            }
          }
        } catch (e) {
          // Bỏ qua
        }
      })
    );
  }

  return {
    updatedPrices: results,
    successCount,
    totalRequested: holdings.length,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source: successCount > 0 ? usedSource : 'MANUAL'
  };
};
