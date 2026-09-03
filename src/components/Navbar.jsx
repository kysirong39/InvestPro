import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PlusCircle, 
  RefreshCw, 
  Download, 
  RotateCcw, 
  Sparkles,
  PieChart,
  History,
  Trash2,
  Settings,
  CheckCheck,
  User,
  Lock,
  ChevronDown,
  Cloud
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

export const Navbar = ({ 
  cashBalance, 
  currentUser,
  cloudSyncState,
  onManualCloudSync,
  onOpenAuthModal,
  onOpenBuyModal, 
  onOpenCashModal, 
  onExport, 
  onReset,
  onClearAll,
  onOpenApiSettings,
  lastSaved,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0a0e17]/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-white truncate">
                  InvestPro
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Pro
                </span>
                {lastSaved && (
                  <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    Đã lưu {lastSaved}
                  </span>
                )}
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 truncate">Theo dõi giá từng lần mua vào & giá vốn thực tế</p>
            </div>
          </div>

          {/* Center Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'portfolio'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" /> Danh Mục
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Lịch Sử Bán
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'advisor'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Quản Trị
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Sức mua / Tiền mặt */}
            <button
              onClick={onOpenCashModal}
              title="Quản lý Tiền mặt / Sức mua"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-500 transition-all text-xs text-amber-300 group"
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase leading-none font-semibold hidden xs:block">Tiền mặt</div>
                <div className="font-bold font-numeric text-amber-400 text-[11px] sm:text-xs">{formatCurrency(cashBalance, 'VND', true)}</div>
              </div>
            </button>

            {/* API Settings Button */}
            <button
              onClick={onOpenApiSettings}
              title="Cấu hình nguồn dữ liệu giá thị trường (VNDIRECT / DNSE / Custom API)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 transition-all text-xs font-semibold"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Nguồn API</span>
            </button>

            {/* Clear All / New Portfolio Button */}
            <button
              onClick={onClearAll}
              title="Xóa toàn bộ danh mục để thiết lập danh mục mới từ đầu"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thiết Lập Mới</span>
            </button>

            {/* Quick Add Buy Order Button */}
            <button
              onClick={onOpenBuyModal}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ Nhập Mua</span>
              <span className="xs:hidden">+ Mua</span>
            </button>

            {/* User Account / Gmail Profile Widget */}
            {currentUser && !currentUser.isGuest ? (
              <div className="flex items-center gap-1 shrink-0">
                {/* Manual Cloud Sync Button */}
                <button
                  onClick={onManualCloudSync}
                  title="Đồng bộ ngay với Google Drive & Đám Mây (Tải hoặc cập nhật giữa Máy tính & Điện thoại)"
                  className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm group"
                >
                  <Cloud className={`w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform ${cloudSyncState === 'syncing' ? 'animate-pulse text-amber-400' : ''}`} />
                  <span className="hidden xl:inline text-[11px]">Đồng Bộ</span>
                </button>

                <button
                  onClick={onOpenAuthModal}
                  title={`Đang đăng nhập: ${currentUser.name} (${currentUser.email}) - Bấm để xem hoặc đổi tài khoản`}
                  className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all text-left shadow-sm"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-7 h-7 rounded-lg object-cover border border-emerald-500/50 shadow-inner shrink-0"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentUser.avatarMeta?.gradient || 'from-emerald-500 to-teal-500'} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-inner`}>
                      {currentUser.avatarMeta?.char || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block pr-1">
                    <div className="text-[11px] font-extrabold text-white leading-tight truncate max-w-[100px]">{currentUser.name}</div>
                    <div className="text-[9px] text-emerald-400 font-numeric leading-tight truncate max-w-[100px]">{currentUser.email}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                title="Đăng nhập Google / Gmail để đồng bộ danh mục xem trên Máy tính và Điện thoại"
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-500/20 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 hover:text-white text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Đăng Nhập Google</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              activeTab === 'portfolio' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Danh Mục
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              activeTab === 'history' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Lịch Sử Bán
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              activeTab === 'advisor' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Tư Vấn
          </button>
        </div>
      </div>
    </header>
  );
};
