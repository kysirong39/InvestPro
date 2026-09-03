import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Smartphone, 
  Laptop, 
  RefreshCw,
  Share2,
  FileCode
} from 'lucide-react';
import { 
  loadPortfolioFromGoogleDrive, 
  savePortfolioToGoogleDrive 
} from '../services/googleDriveSyncService';
import { exportPortfolioJSON } from '../utils/storage';

export const CloudSyncModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  data, 
  onApplyPortfolioData,
  onOpenAuthModal 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [needEnableApi, setNeedEnableApi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // 1. Tải danh mục từ Google Drive về máy này
  const handlePullFromDrive = async () => {
    if (!currentUser?.accessToken) {
      onOpenAuthModal();
      return;
    }

    setIsProcessing(true);
    setSyncStatusMsg('Đang kiểm tra và tải dữ liệu từ Google Drive...');
    setNeedEnableApi(false);

    try {
      const result = await loadPortfolioFromGoogleDrive(currentUser.accessToken);
      if (result.data && Array.isArray(result.data.holdings)) {
        onApplyPortfolioData(result.data);
        setSyncStatusMsg(`✓ Đã đồng bộ thành công! Đã nạp ${result.data.holdings.length} mã cổ phiếu từ Google Drive.`);
      } else {
        if (result.needEnableApi) {
          setNeedEnableApi(true);
        }
        setSyncStatusMsg(result.error || 'Chưa tìm thấy dữ liệu danh mục trên Google Drive.');
      }
    } catch (err) {
      setSyncStatusMsg('Lỗi kết nối: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Đẩy danh mục từ máy này lên Google Drive
  const handlePushToDrive = async () => {
    if (!currentUser?.accessToken) {
      onOpenAuthModal();
      return;
    }

    setIsProcessing(true);
    setSyncStatusMsg('Đang tải danh mục lên Google Drive...');
    setNeedEnableApi(false);

    try {
      const result = await savePortfolioToGoogleDrive(data, currentUser.accessToken);
      if (result.success) {
        setSyncStatusMsg('✓ Đã lưu danh mục lên Google Drive thành công! Bạn có thể mở trên máy tính khác hoặc điện thoại.');
      } else {
        if (result.needEnableApi) {
          setNeedEnableApi(true);
        }
        setSyncStatusMsg(result.error || 'Không thể lưu lên Google Drive.');
      }
    } catch (err) {
      setSyncStatusMsg('Lỗi kết nối: ' + err.message);
    } finally {
      setIsProcessing(false);
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
                <span>Trung Tâm Đồng Bộ Đám Mây</span>
              </h3>
              <p className="text-[11px] text-slate-400">Đồng bộ danh mục giữa Máy tính và Điện thoại</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status */}
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

          {currentUser?.isGuest ? (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black shrink-0"
            >
              Đăng Nhập Google
            </button>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              ✓ Đã Đăng Nhập
            </span>
          )}
        </div>

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

        {/* Status Notification */}
        {syncStatusMsg && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-indigo-500/40 text-slate-200 text-xs mb-5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{syncStatusMsg}</span>
          </div>
        )}

        {/* ACTION CARDS */}
        <div className="space-y-4">
          
          {/* 1. Google Drive Two-Way Sync */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-extrabold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Đồng Bộ Google Drive AppData</span>
              </span>
              <span className="text-[10px] text-slate-500">{data.holdings.length} mã CP hiện tại</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePullFromDrive}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4 text-indigo-400" />
                <span>Tải Từ Google Drive</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePushToDrive}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Lưu Lên Google Drive</span>
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
              Bấm sao chép link bên dưới và gửi sang Zalo / Tin nhắn để mở trên Điện thoại hoặc Máy tính khác — toàn bộ danh mục sẽ hiển thị ngay lập tức không cần đăng nhập lại.
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
