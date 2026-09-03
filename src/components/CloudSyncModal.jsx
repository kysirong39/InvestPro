import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ExternalLink, 
  Copy, 
  RefreshCw,
  Share2,
  KeyRound,
  ShieldCheck,
  Database
} from 'lucide-react';
import { 
  loadPortfolioFromGoogleDrive, 
  savePortfolioToGoogleDrive 
} from '../services/googleDriveSyncService';
import { formatCurrency } from '../utils/finance';

export const CloudSyncModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  data, 
  onApplyPortfolioData,
  onOpenAuthModal 
}) => {
  const [pulling, setPulling] = useState(false);
  const [pushing, setPushing] = useState(false);
  
  // Status: { type: 'idle' | 'loading' | 'success' | 'error' | 'warning', message: '', time: '' }
  const [status, setStatus] = useState({ type: 'idle', message: '', time: '' });
  const [needEnableApi, setNeedEnableApi] = useState(false);
  const [needReauth, setNeedReauth] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // 1. Tải danh mục từ Google Drive về máy này
  const handlePullFromDrive = async () => {
    if (!currentUser?.accessToken || currentUser?.isGuest) {
      setStatus({
        type: 'warning',
        message: 'Bạn chưa đăng nhập tài khoản Google hoặc phiên đã hết hạn. Vui lòng bấm Đăng Nhập bên dưới.',
        time: new Date().toLocaleTimeString('vi-VN')
      });
      setNeedReauth(true);
      return;
    }

    setPulling(true);
    setNeedEnableApi(false);
    setNeedReauth(false);
    setStatus({
      type: 'loading',
      message: 'Đang kết nối Google Drive để tìm kiếm danh mục mới nhất...',
      time: new Date().toLocaleTimeString('vi-VN')
    });

    try {
      const result = await loadPortfolioFromGoogleDrive(currentUser.accessToken);
      
      if (result.data && Array.isArray(result.data.holdings)) {
        onApplyPortfolioData(result.data);
        setStatus({
          type: 'success',
          message: `✓ Đã tải và đồng bộ thành công ${result.data.holdings.length} mã cổ phiếu từ Google Drive về máy này!`,
          time: new Date().toLocaleTimeString('vi-VN')
        });
      } else {
        if (result.needEnableApi) {
          setNeedEnableApi(true);
        }
        if (result.needReauth) {
          setNeedReauth(true);
        }
        setStatus({
          type: result.needEnableApi ? 'warning' : 'error',
          message: result.error || 'Chưa tìm thấy file danh mục trên Google Drive của tài khoản này.',
          time: new Date().toLocaleTimeString('vi-VN')
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Lỗi kết nối: ' + err.message,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    } finally {
      setPulling(false);
    }
  };

  // 2. Đẩy danh mục từ máy này lên Google Drive
  const handlePushToDrive = async () => {
    if (!currentUser?.accessToken || currentUser?.isGuest) {
      setStatus({
        type: 'warning',
        message: 'Bạn chưa đăng nhập tài khoản Google hoặc phiên đã hết hạn. Vui lòng bấm Đăng Nhập bên dưới.',
        time: new Date().toLocaleTimeString('vi-VN')
      });
      setNeedReauth(true);
      return;
    }

    setPushing(true);
    setNeedEnableApi(false);
    setNeedReauth(false);
    setStatus({
      type: 'loading',
      message: 'Đang tải toàn bộ dữ liệu danh mục lên Google Drive của bạn...',
      time: new Date().toLocaleTimeString('vi-VN')
    });

    try {
      const result = await savePortfolioToGoogleDrive(data, currentUser.accessToken);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `✓ Đã lưu thành công ${result.holdingsCount || data.holdings.length} mã cổ phiếu lên Google Drive lúc ${result.savedAt || new Date().toLocaleTimeString('vi-VN')}! Dữ liệu đã sẵn sàng để mở trên máy tính khác hoặc điện thoại.`,
          time: result.savedAt || new Date().toLocaleTimeString('vi-VN')
        });
      } else {
        if (result.needEnableApi) {
          setNeedEnableApi(true);
        }
        if (result.needReauth) {
          setNeedReauth(true);
        }
        setStatus({
          type: result.needEnableApi ? 'warning' : 'error',
          message: result.error || 'Không thể lưu lên Google Drive.',
          time: new Date().toLocaleTimeString('vi-VN')
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Lỗi kết nối: ' + err.message,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    } finally {
      setPushing(false);
    }
  };

  // 3. Tạo Magic Sync Link (Link chuyển nhanh sang điện thoại / máy khác)
  const handleCopyMagicLink = () => {
    try {
      const payload = {
        h: data.holdings.map(h => ({
          i: h.id,
          s: h.symbol,
          p: h.currentPrice,
          c: h.sector,
          e: h.exchange,
          l: h.lots
        })),
        c: data.cashBalance,
        t: data.realizedTrades
      };

      const jsonStr = JSON.stringify(payload);
      const encoded = btoa(encodeURIComponent(jsonStr));
      const syncUrl = `${window.location.origin}${window.location.pathname}#sync=${encoded}`;

      navigator.clipboard.writeText(syncUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error('Lỗi tạo link:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-slate-700/90 shadow-2xl p-5 sm:p-7 my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Trung Tâm Đồng Bộ Google Drive</span>
              </h3>
              <p className="text-[11px] text-slate-400">Đồng bộ tự động & thủ công giữa Máy tính và Điện thoại</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover border border-emerald-500/40 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-white truncate">{currentUser?.name}</div>
              <div className="text-[11px] text-slate-400 font-numeric truncate">{currentUser?.email}</div>
            </div>
          </div>

          {currentUser?.isGuest || !currentUser?.accessToken ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black shrink-0 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đăng Nhập Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đã Kết Nối API</span>
            </div>
          )}
        </div>

        {/* Dynamic Status Notification Alert Box */}
        {status.type !== 'idle' && (
          <div className={`p-4 rounded-2xl border text-xs mb-5 transition-all animate-in fade-in duration-150 ${
            status.type === 'loading'
              ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
              : status.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-500/10'
              : status.type === 'warning'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {status.type === 'loading' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0 mt-0.5" />}
              {status.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {status.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {status.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              
              <div className="space-y-1 flex-1 min-w-0">
                <div className="font-bold leading-relaxed">{status.message}</div>
                {status.time && <div className="text-[10px] opacity-70 font-numeric">Thời gian: {status.time}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Re-authenticate Action if needed */}
        {needReauth && (
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 text-xs mb-5 flex items-center justify-between gap-3">
            <span className="text-slate-300 text-[11px]">Bấm vào đây để làm mới quyền truy cập Google:</span>
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shrink-0"
            >
              Đăng Nhập Lại
            </button>
          </div>
        )}

        {/* Need Enable Google Drive API Alert */}
        {needEnableApi && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs mb-5 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Yêu cầu kích hoạt Google Drive API (Chỉ làm 1 lần)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Google yêu cầu bật dịch vụ <strong>Google Drive API</strong> trên dự án Google Cloud của bạn để cho phép lưu trữ danh mục.
            </p>
            <a
              href="https://console.cloud.google.com/apis/library/drive.googleapis.com?project=348083573261"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-md"
            >
              <span>Bật Google Drive API trên Google Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* ACTION CARDS */}
        <div className="space-y-4">
          
          {/* 1. Google Drive Two-Way Sync Actions */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-extrabold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Thao Tác Đồng Bộ Google Drive</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {data.holdings.length} mã CP hiện tại
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Pull Button */}
              <button
                type="button"
                disabled={pulling || pushing}
                onClick={handlePullFromDrive}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 group shadow-sm"
              >
                <DownloadCloud className={`w-4 h-4 text-indigo-400 group-hover:-translate-y-0.5 transition-transform ${pulling ? 'animate-bounce' : ''}`} />
                <span>{pulling ? 'Đang Tải...' : 'Tải Từ Drive'}</span>
              </button>

              {/* Push Button */}
              <button
                type="button"
                disabled={pulling || pushing}
                onClick={handlePushToDrive}
                className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 active:scale-95 group"
              >
                <UploadCloud className={`w-4 h-4 group-hover:-translate-y-0.5 transition-transform ${pushing ? 'animate-bounce' : ''}`} />
                <span>{pushing ? 'Đang Lưu...' : 'Lưu Lên Drive'}</span>
              </button>
            </div>
          </div>

          {/* 2. Magic Sync Link (Instant Share to Phone/PC) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="text-xs font-extrabold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-teal-400" />
                <span>Link Mở Nhanh Trên Điện Thoại & Máy Khác</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sao chép link này và mở trên bất kỳ máy tính hoặc điện thoại nào — toàn bộ danh mục sẽ hiển thị ngay lập tức mà không cần đăng nhập.
            </p>

            <button
              type="button"
              onClick={handleCopyMagicLink}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                copiedLink 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                  : 'bg-slate-900 hover:bg-slate-850 border-teal-500/40 text-teal-300 hover:border-teal-400'
              }`}
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
              <span>{copiedLink ? '✓ Đã Sao Chép Link Vào Bộ Nhớ Tạm!' : '🔗 Sao Chép Link Danh Mục'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
