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
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

export const Navbar = ({ 
  cashBalance, 
  currentUser,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  InvestPro
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Tax-Lot Pro
                </span>
                {lastSaved && (
                  <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    Đã lưu {lastSaved}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Theo dõi giá từng lần mua vào & giá vốn bình quân thực tế</p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'portfolio'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PieChart className="w-4 h-4" /> Danh Mục Đầu Tư
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" /> Lịch Sử Bán Dần & Lãi Đã Chốt
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'advisor'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Tư Vấn Quản Trị Danh Mục
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sức mua / Tiền mặt */}
            <button
              onClick={onOpenCashModal}
              title="Quản lý Tiền mặt / Sức mua"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-500 transition-all text-xs text-amber-300 group"
            >
              <Wallet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase leading-none font-semibold">Tiền mặt</div>
                <div className="font-bold font-numeric text-amber-400">{formatCurrency(cashBalance, 'VND', true)}</div>
              </div>
            </button>

            {/* API Settings Button */}
            <button
              onClick={onOpenApiSettings}
              title="Cấu hình nguồn dữ liệu giá thị trường (VNDIRECT / DNSE / Custom API)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 transition-all text-xs font-semibold"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Nguồn API</span>
            </button>

            {/* Clear All / New Portfolio Button */}
            <button
              onClick={onClearAll}
              title="Xóa toàn bộ danh mục để thiết lập danh mục mới từ đầu"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thiết Lập Mới</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={onExport}
              title="Xuất file sao lưu (JSON)"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all hidden sm:block"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Quick Add Buy Order Button */}
            <button
              onClick={onOpenBuyModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nhập Lệnh Mua</span>
            </button>

            {/* User Account / Gmail Profile Widget */}
            {currentUser && !currentUser.isGuest ? (
              <button
                onClick={onOpenAuthModal}
                title={`Đang đăng nhập: ${currentUser.name} (${currentUser.email}) - Bấm để chuyển tài khoản hoặc đăng xuất`}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-indigo-500/40 hover:border-indigo-400 transition-all text-left group shadow-sm"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentUser.avatarMeta?.gradient || 'from-indigo-500 to-teal-500'} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-inner`}>
                  {currentUser.avatarMeta?.char || 'U'}
                </div>
                <div className="hidden xl:block pr-1">
                  <div className="text-[11px] font-extrabold text-white leading-tight truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[9px] text-slate-400 leading-tight truncate max-w-[120px]">{currentUser.email}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                title="Đăng nhập Gmail để quản lý danh mục riêng biệt"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-500/20 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 hover:text-white text-xs font-bold transition-all shadow-sm group"
              >
                <User className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Đăng Nhập Gmail</span>
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
