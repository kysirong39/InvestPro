/**
 * Dữ liệu mẫu danh mục đầu tư thực tế với các lô mua & lịch sử bán dần
 */

export const INITIAL_CASH = 150000000; // 150 triệu tiền mặt khả dụng

export const INITIAL_HOLDINGS = [
  {
    id: 'fpt-tech',
    symbol: 'FPT',
    name: 'CTCP FPT (Công nghệ & Viễn thông)',
    assetClass: 'stock',
    sector: 'Công nghệ thông tin',
    exchange: 'HOSE',
    currentPrice: 138500,
    dailyChange: 1.84,
    lots: [
      {
        id: 'fpt-lot-1',
        date: '2024-01-15',
        buyPrice: 85000,
        quantity: 2000,
        remainingQty: 1500, // Đã bán dần 500 CP
        fee: 127500,
        tax: 0,
        note: 'Tích sản vùng hỗ trợ MA200'
      },
      {
        id: 'fpt-lot-2',
        date: '2024-03-12',
        buyPrice: 102000,
        quantity: 1500,
        remainingQty: 1500,
        fee: 114750,
        tax: 0,
        note: 'Mua gia tăng khi vượt đỉnh lịch sử 100k'
      },
      {
        id: 'fpt-lot-3',
        date: '2024-06-05',
        buyPrice: 121000,
        quantity: 1000,
        remainingQty: 1000,
        fee: 90750,
        tax: 0,
        note: 'Mua theo đà tăng trưởng mảng AI & Chip bán dẫn'
      }
    ]
  },
  {
    id: 'hpg-steel',
    symbol: 'HPG',
    name: 'CTCP Tập đoàn Hòa Phát',
    assetClass: 'stock',
    sector: 'Thép & Vật liệu',
    exchange: 'HOSE',
    currentPrice: 26800,
    dailyChange: -0.74,
    lots: [
      {
        id: 'hpg-lot-1',
        date: '2023-11-10',
        buyPrice: 23500,
        quantity: 5000,
        remainingQty: 3000, // Đã bán bớt 2000 CP
        fee: 88125,
        tax: 0,
        note: 'Đáy chu kỳ ngành thép Dung Quất 2'
      },
      {
        id: 'hpg-lot-2',
        date: '2024-02-20',
        buyPrice: 27500,
        quantity: 3000,
        remainingQty: 3000,
        fee: 61875,
        tax: 0,
        note: 'Gom thêm trước kỳ đại hội cổ đông'
      },
      {
        id: 'hpg-lot-3',
        date: '2024-05-18',
        buyPrice: 29200,
        quantity: 2000,
        remainingQty: 2000,
        fee: 43800,
        tax: 0,
        note: 'Mua test sóng bứt phá'
      }
    ]
  },
  {
    id: 'mwg-retail',
    symbol: 'MWG',
    name: 'CTCP Đầu tư Thế Giới Di Động',
    assetClass: 'stock',
    sector: 'Bán lẻ tiêu dùng',
    exchange: 'HOSE',
    currentPrice: 65400,
    dailyChange: 2.19,
    lots: [
      {
        id: 'mwg-lot-1',
        date: '2023-12-08',
        buyPrice: 42500,
        quantity: 2500,
        remainingQty: 2500,
        fee: 79688,
        tax: 0,
        note: 'Bắt đáy Bách Hóa Xanh hòa vốn'
      },
      {
        id: 'mwg-lot-2',
        date: '2024-04-14',
        buyPrice: 54000,
        quantity: 1500,
        remainingQty: 1500,
        fee: 60750,
        tax: 0,
        note: 'Tăng tỷ trọng sau tái cấu trúc cửa hàng'
      }
    ]
  },
  {
    id: 'tcb-bank',
    symbol: 'TCB',
    name: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    assetClass: 'stock',
    sector: 'Ngân hàng',
    exchange: 'HOSE',
    currentPrice: 25600,
    dailyChange: 0.39,
    lots: [
      {
        id: 'tcb-lot-1',
        date: '2024-01-08',
        buyPrice: 21800,
        quantity: 4000,
        remainingQty: 4000,
        fee: 65400,
        tax: 0,
        note: 'Định giá P/B dưới 1.0, Casa top đầu ngành'
      }
    ]
  },
  {
    id: 'e1vfvn30-etf',
    symbol: 'E1VFVN30',
    name: 'Quỹ ETF DCVFMVN30',
    assetClass: 'etf',
    sector: 'Quỹ chỉ số',
    exchange: 'HOSE',
    currentPrice: 24200,
    dailyChange: 0.62,
    lots: [
      {
        id: 'etf-lot-1',
        date: '2024-02-01',
        buyPrice: 20500,
        quantity: 6000,
        remainingQty: 6000,
        fee: 92250,
        tax: 0,
        note: 'Chiến lược tích sản thụ động theo VN30'
      }
    ]
  }
];

export const INITIAL_REALIZED_TRADES = [
  {
    id: 'trade-fpt-01',
    symbol: 'FPT',
    sellDate: '2024-05-20',
    sellPrice: 115000,
    sellQty: 500,
    method: 'FIFO',
    grossProceeds: 57500000,
    totalFeeAndTax: 143750, // 0.25%
    netProceeds: 57356250,
    totalBuyCost: 42500000, // 500 CP x 85,000đ (từ Lô 1)
    realizedPnL: 14856250,
    realizedPnLPct: 34.96,
    note: 'Chốt lời từng phần 500 CP Lô 1 khi chạm mốc 115k',
    lotBreakdowns: [
      {
        lotId: 'fpt-lot-1',
        lotDate: '2024-01-15',
        buyPrice: 85000,
        qtySold: 500,
        lotRemainingBefore: 2000,
        lotRemainingAfter: 1500,
        realizedPnL: 14856250,
        realizedPnLPct: 34.96
      }
    ]
  },
  {
    id: 'trade-hpg-01',
    symbol: 'HPG',
    sellDate: '2024-03-28',
    sellPrice: 30500,
    sellQty: 2000,
    method: 'FIFO',
    grossProceeds: 61000000,
    totalFeeAndTax: 152500,
    netProceeds: 60847500,
    totalBuyCost: 47000000, // 2000 CP x 23,500đ (từ Lô 1)
    realizedPnL: 13847500,
    realizedPnLPct: 29.46,
    note: 'Hiện thực hóa lợi nhuận 2000 CP khi chạm kháng cự 30k',
    lotBreakdowns: [
      {
        lotId: 'hpg-lot-1',
        lotDate: '2023-11-10',
        buyPrice: 23500,
        qtySold: 2000,
        lotRemainingBefore: 5000,
        lotRemainingAfter: 3000,
        realizedPnL: 13847500,
        realizedPnLPct: 29.46
      }
    ]
  }
];

// Danh sách mã chứng khoán & tài sản phổ biến để gợi ý khi mua
export const POPULAR_SYMBOLS = [
  { symbol: 'FPT', name: 'CTCP FPT', exchange: 'HOSE', price: 138500, sector: 'Công nghệ' },
  { symbol: 'HPG', name: 'Tập đoàn Hòa Phát', exchange: 'HOSE', price: 26800, sector: 'Thép' },
  { symbol: 'MWG', name: 'Thế Giới Di Động', exchange: 'HOSE', price: 65400, sector: 'Bán lẻ' },
  { symbol: 'TCB', name: 'Techcombank', exchange: 'HOSE', price: 25600, sector: 'Ngân hàng' },
  { symbol: 'MBB', name: 'MBBank', exchange: 'HOSE', price: 24300, sector: 'Ngân hàng' },
  { symbol: 'VNM', name: 'Vinamilk', exchange: 'HOSE', price: 68500, sector: 'Thực phẩm' },
  { symbol: 'SSI', name: 'Chứng khoán SSI', exchange: 'HOSE', price: 34200, sector: 'Chứng khoán' },
  { symbol: 'VHM', name: 'Vinhomes', exchange: 'HOSE', price: 43200, sector: 'Bất động sản' },
  { symbol: 'VIC', name: 'Vingroup', exchange: 'HOSE', price: 44800, sector: 'Bất động sản' },
  { symbol: 'DGC', name: 'Hóa chất Đức Giang', exchange: 'HOSE', price: 114000, sector: 'Hóa chất' },
  { symbol: 'CTR', name: 'Viettel Construction', exchange: 'HOSE', price: 128000, sector: 'Công nghệ' },
  { symbol: 'E1VFVN30', name: 'ETF DCVFMVN30', exchange: 'HOSE', price: 24200, sector: 'Quỹ ETF' },
  { symbol: 'FUESSVFL', name: 'ETF SSIAM VNFIN LEAD', exchange: 'HOSE', price: 21500, sector: 'Quỹ ETF' },
  { symbol: 'SJC', name: 'Vàng miếng SJC (Lượng)', exchange: 'GOLD', price: 89500000, sector: 'Vàng' },
  { symbol: 'BTC', name: 'Bitcoin (USD)', exchange: 'CRYPTO', price: 63500, sector: 'Crypto' }
];
