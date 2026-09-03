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
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { 
  loadPortfolioFromGoogleDrive, 
  savePortfolioToGoogleDrive 
} from '../services/googleDriveSyncService';
import { GOOGLE_CLIENT_ID, loginWithGoogle } from '../services/authService';
import { exportPortfolioJSON } from '../utils/storage';

export const CloudSyncModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  data, 
  onApplyPortfolioData,
  onUserChanged,
  onOpenAuthModal 
}) => {
  const [pulling, setPulling] = useState(false);
  const [pushing, setPushing] = useState(false);
  
  // Status: { type: 'idle' | 'loading' | 'success' | 'error' | 'warning', message: '', time: '' }
  const [status, setStatus] = useState({ type: 'idle', message: '', time: '' });
  const [needEnableApi, setNeedEnableApi] = useState(false);
  const [needDriveConsent, setNeedDriveConsent] = useState(false);
  const [google403Error, setGoogle403Error] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Cấp quyền Google Drive
  const requestDriveScope = (onSuccess) => {
    if (!window.google?.accounts?.oauth2) return;

    setStatus({
      type: 'loading',
      message: 'Đang mở cửa sổ cấp quyền Google Drive...',
      time: new Date().toLocaleTimeString('vi-VN')
    });
    setGoogle403Error(false);

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            const updatedUser = {
              ...currentUser,
              accessToken: tokenResponse.access_token
            };
            if (onUserChanged) onUserChanged(updatedUser);
            setNeedDriveConsent(false);
            setGoogle403Error(false);
            if (onSuccess) {
              onSuccess(tokenResponse.access_token);
            }
          } else if (tokenResponse?.error) {
            if (tokenResponse.error === 'access_denied' || tokenResponse.error_description?.includes('blocked')) {
              setGoogle403Error(true);
            }
            setStatus({
              type: 'error',
              message: 'Google từ chối cấp quyền Drive (Error: ' + tokenResponse.error + '). Hãy xem hướng dẫn bên dưới.',
              time: new Date().toLocaleTimeString('vi-VN')
            });
          }
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error('Lỗi mở popup Google Drive:', err);
    }
  };

  // Đăng nhập tài khoản Google cơ bản
  const handleDirectGoogleLogin = () => {
    if (!window.google?.accounts?.oauth2) return;

    setStatus({
      type: 'loading',
      message: 'Đang mở cửa sổ đăng nhập Google...',
      time: new Date().toLocaleTimeString('vi-VN')
    });

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });

              if (res.ok) {
                const profile = await res.json();
                const user = loginWithGoogle({
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  accessToken: tokenResponse.access_token
                });

                if (onUserChanged) onUserChanged(user);
                setStatus({
                  type: 'success',
                  message: `✓ Đã đăng nhập tài khoản: ${profile.email}!`,
                  time: new Date().toLocaleTimeString('vi-VN')
                });
              }
            } catch (fetchErr) {
              console.error('Lỗi fetch Google userinfo:', fetchErr);
            }
          }
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Lỗi đăng nhập Google:', err);
    }
  };

  // 1. Tải danh mục từ Google Drive
  const handlePullFromDrive = async (tokenOverride) => {
    const token = tokenOverride || currentUser?.accessToken;

    if (currentUser?.isGuest || !currentUser?.email) {
      setStatus({
        type: 'warning',
        message: 'Vui lòng bấm [Đăng Nhập Google] ở trên để tải danh mục.',
        time: new Date().toLocaleTimeString('vi-VN')
      });
      return;
    }

    setPulling(true);
    setNeedEnableApi(false);
    setNeedDriveConsent(false);
    setStatus({
      type: 'loading',
      message: 'Đang tìm kiếm file danh mục trên Google Drive của bạn...',
      time: new Date().toLocaleTimeString('vi-VN')
    });

    try {
      const result = await loadPortfolioFromGoogleDrive(token);
      
      if (result.data && Array.isArray(result.data.holdings)) {
        onApplyPortfolioData(result.data);
        setStatus({
          type: 'success',
          message: `✓ Đã tải và đồng bộ thành công ${result.data.holdings.length} mã cổ phiếu từ Google Drive!`,
          time: new Date().toLocaleTimeString('vi-VN')
        });
      } else {
        if (result.error && (result.error.includes('scope') || result.error.includes('insufficient') || result.needReauth)) {
          setNeedDriveConsent(true);
          setStatus({
            type: 'warning',
            message: 'Cần cấp quyền truy cập Google Drive. Bấm nút [Cấp Quyền Google Drive] bên dưới.',
            time: new Date().toLocaleTimeString('vi-VN')
          });
          return;
        }

        if (result.needEnableApi) setNeedEnableApi(true);

        setStatus({
          type: result.needEnableApi ? 'warning' : 'error',
          message: result.error || 'Chưa tìm thấy file danh mục trên Google Drive.',
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

  // 2. Đẩy danh mục lên Google Drive
  const handlePushToDrive = async (tokenOverride) => {
    const token = tokenOverride || currentUser?.accessToken;

    if (currentUser?.isGuest || !currentUser?.email) {
      setStatus({
        type: 'warning',
        message: 'Vui lòng bấm [Đăng Nhập Google] ở trên để lưu danh mục.',
        time: new Date().toLocaleTimeString('vi-VN')
      });
      return;
    }

    setPushing(true);
    setNeedEnableApi(false);
    setNeedDriveConsent(false);
    setStatus({
      type: 'loading',
      message: 'Đang tải toàn bộ dữ liệu danh mục lên Google Drive...',
      time: new Date().toLocaleTimeString('vi-VN')
    });

    try {
      const result = await savePortfolioToGoogleDrive(data, token);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `✓ Đã lưu thành công ${result.holdingsCount || data.holdings.length} mã cổ phiếu lên Google Drive lúc ${result.savedAt || new Date().toLocaleTimeString('vi-VN')}!`,
          time: result.savedAt || new Date().toLocaleTimeString('vi-VN')
        });
      } else {
        if (result.error && (result.error.includes('scope') || result.error.includes('insufficient') || result.needReauth)) {
          setNeedDriveConsent(true);
          setStatus({
            type: 'warning',
            message: 'Cần cấp quyền ghi file vào Google Drive. Bấm nút [Cấp Quyền Google Drive] bên dưới.',
            time: new Date().toLocaleTimeString('vi-VN')
          });
          return;
        }

        if (result.needEnableApi) setNeedEnableApi(true);

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
      setTimeout(() => setCopiedLink(false), 3500);
    } catch (err) {
      console.error('Lỗi tạo link:', err);
    }
  };

  // 4. Nhập file JSON thủ công
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (json && Array.isArray(json.holdings)) {
          onApplyPortfolioData(json);
          setStatus({
            type: 'success',
            message: `✓ Đã nạp thành công ${json.holdings.length} mã cổ phiếu từ file sao lưu!`,
            time: new Date().toLocaleTimeString('vi-VN')
          });
        }
      } catch (err) {
        setStatus({
          type: 'error',
          message: 'File không đúng định dạng InvestPro JSON.',
          time: new Date().toLocaleTimeString('vi-VN')
        });
      }
    };
    reader.readAsText(file);
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
                <span>Trung Tâm Đồng Bộ Danh Mục</span>
              </h3>
              <p className="text-[11px] text-slate-400">Đồng bộ giữa Máy tính & Điện thoại linh hoạt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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

          {currentUser?.isGuest ? (
            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black shrink-0 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-sm cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đăng Nhập Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đã Đăng Nhập</span>
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

        {/* Google 403 Access Blocked Specific Guide */}
        {(google403Error || needDriveConsent) && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/60 text-xs mb-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Cách Xử Lý Lỗi 403 (Access Blocked) Của Google</span>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Google Drive yêu cầu thêm tài khoản Gmail <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-numeric">{currentUser?.email || 'kysirong39@gmail.com'}</strong> vào danh sách <strong>Test users</strong> trên Google Cloud Console (chỉ mất 30 giây làm 1 lần duy nhất):
            </p>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Bấm nút <strong>Mở Cấu Hình Google Console</strong> bên dưới.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Cuộn xuống mục <strong>Test users</strong> (Người dùng thử nghiệm) &rarr; Bấm <strong>+ ADD USERS</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Nhập email <strong className="text-emerald-400 font-numeric">{currentUser?.email || 'kysirong39@gmail.com'}</strong> &rarr; Bấm <strong>SAVE</strong>.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://console.cloud.google.com/apis/credentials/consent?project=348083573261"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition-all shadow-md active:scale-95"
              >
                <span>Mở Google Console Thêm Test User (30s)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => requestDriveScope((newToken) => handlePushToDrive(newToken))}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử Cấp Quyền Lại</span>
              </button>
            </div>
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
              Google yêu cầu bật dịch vụ <strong>Google Drive API</strong> trên dự án Google Cloud của bạn.
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
          
          {/* OPTION 1: MAGIC SYNC LINK (RECOMMENDED - 100% RELIABLE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40 border border-teal-500/40 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-teal-300">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Link Mở Nhanh Đa Thiết Bị (Không Lo Lỗi 403)</span>
              </span>
              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                Mở Tức Thì
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Bấm sao chép link và dán vào trình duyệt trên Điện thoại hoặc Máy tính khác &mdash; toàn bộ danh mục, tiền mặt và lịch sử sẽ được chuyển sang ngay lập tức.
            </p>

            <button
              type="button"
              onClick={handleCopyMagicLink}
              className={`w-full py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99] ${
                copiedLink 
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-emerald-500/25' 
                  : 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-slate-950 font-black shadow-teal-500/20'
              }`}
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? '✓ Đã Sao Chép Link! Hãy Dán Vào Máy Khác' : '🔗 Sao Chép Link Chuyển Sang Thiết Bị Khác'}</span>
            </button>
          </div>

          {/* OPTION 2: GOOGLE DRIVE TWO-WAY SYNC */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-extrabold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Đồng Bộ Trực Tiếp Google Drive</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-numeric">
                {data.holdings.length} mã CP hiện tại
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Pull Button */}
              <button
                type="button"
                disabled={pulling || pushing}
                onClick={() => handlePullFromDrive()}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 group shadow-sm cursor-pointer"
              >
                <DownloadCloud className={`w-4 h-4 text-indigo-400 group-hover:-translate-y-0.5 transition-transform ${pulling ? 'animate-bounce' : ''}`} />
                <span>{pulling ? 'Đang Tải...' : 'Tải Từ Drive'}</span>
              </button>

              {/* Push Button */}
              <button
                type="button"
                disabled={pulling || pushing}
                onClick={() => handlePushToDrive()}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 active:scale-95 group cursor-pointer"
              >
                <UploadCloud className={`w-4 h-4 group-hover:-translate-y-0.5 transition-transform ${pushing ? 'animate-bounce' : ''}`} />
                <span>{pushing ? 'Đang Lưu...' : 'Lưu Lên Drive'}</span>
              </button>
            </div>
          </div>

          {/* OPTION 3: EXPORT / IMPORT JSON */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 text-[11px]">Sao lưu tệp JSON:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportPortfolioJSON(data)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Tải File</span>
              </button>

              <label className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Nạp File</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
