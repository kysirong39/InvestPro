import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Cloud, 
  Lock,
  LogOut,
  Zap,
  Loader2
} from 'lucide-react';
import { 
  loginWithGmail, 
  loginWithGoogle, 
  GOOGLE_CLIENT_ID,
  logoutUser 
} from '../services/authService';

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUserChanged 
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleGisReady, setIsGoogleGisReady] = useState(false);

  // Khởi tạo Google Identity Services (GIS) với Client ID chính chủ của người dùng
  useEffect(() => {
    if (!isOpen) return;

    let tokenClient = null;

    const initGis = () => {
      if (window.google?.accounts?.id && window.google?.accounts?.oauth2) {
        try {
          // 1. Initialize Credential JWT flow
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleJwtResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('googleSignInBtnDiv');
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_blue',
              size: 'large',
              shape: 'pill',
              text: 'continue_with',
              width: 320,
              logo_alignment: 'left'
            });
          }

          setIsGoogleGisReady(true);
        } catch (err) {
          console.warn('Lỗi khởi tạo GIS:', err);
        }
      }
    };

    // Kiểm tra script đã tải xong chưa
    if (window.google?.accounts) {
      initGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(timer);
          initGis();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Xử lý khi đăng nhập thành công qua JWT Credential
  const handleGoogleJwtResponse = (response) => {
    setIsProcessing(true);
    try {
      if (response && response.credential) {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const googleProfile = JSON.parse(jsonPayload);
        const user = loginWithGoogle({
          email: googleProfile.email,
          name: googleProfile.name,
          picture: googleProfile.picture
        });

        onUserChanged(user);
        onClose();
      }
    } catch (err) {
      console.error('Lỗi giải mã Google Token:', err);
      setErrorMsg('Không thể giải mã phản hồi từ Google. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Kích hoạt Google OAuth 2.0 Popup chính thức
  const handleTriggerGooglePopup = () => {
    setErrorMsg('');
    if (!window.google?.accounts?.oauth2) {
      setErrorMsg('Đang tải thư viện xác thực Google, vui lòng chờ 1-2 giây...');
      return;
    }

    setIsProcessing(true);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid https://www.googleapis.com/auth/drive.appdata',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Lấy thông tin người dùng từ Google UserInfo API
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`
                }
              });

              if (res.ok) {
                const profile = await res.json();
                const user = loginWithGoogle({
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  accessToken: tokenResponse.access_token
                });

                onUserChanged(user);
                onClose();
              } else {
                setErrorMsg('Không lấy được thông tin từ Google API.');
              }
            } catch (fetchErr) {
              console.error('Lỗi fetch Google userinfo:', fetchErr);
              setErrorMsg('Lỗi kết nối máy chủ Google.');
            } finally {
              setIsProcessing(false);
            }
          } else if (tokenResponse?.error) {
            console.warn('Google OAuth error:', tokenResponse.error);
            setIsProcessing(false);
          }
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Lỗi mở popup Google:', err);
      setErrorMsg('Không thể mở cửa sổ Google. Hãy kiểm tra trình duyệt có chặn popup không.');
      setIsProcessing(false);
    }
  };

  // Đăng nhập nhanh bằng Gmail nếu muốn
  const handleQuickGmailLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    let cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      cleanEmail += '@gmail.com';
    }

    setIsProcessing(true);
    try {
      const user = loginWithGmail(cleanEmail, nameInput.trim());
      onUserChanged(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đăng nhập.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    const guest = logoutUser();
    onUserChanged(guest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md glass-card rounded-3xl border border-slate-700/90 shadow-2xl p-5 sm:p-7 my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Xác Thực Google / Gmail</span>
              </h3>
              <p className="text-[11px] text-slate-400">Đồng bộ danh mục xem trên Máy tính & Điện thoại</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Status (Nếu đã đăng nhập) */}
        {!currentUser?.isGuest && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-9 h-9 rounded-xl object-cover border border-emerald-500/50 shadow-sm shrink-0"
                />
              ) : (
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentUser.avatarMeta?.gradient || 'from-emerald-500 to-teal-600'} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                  {currentUser.avatarMeta?.char || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-emerald-400 font-numeric truncate">{currentUser.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs mb-4">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          
          {/* 1. PRIMARY OFFICIAL GOOGLE AUTH BUTTON */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleTriggerGooglePopup}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all border border-slate-300 group"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Đăng Nhập Bằng Tài Khoản Google</span>
            </button>

            {/* Native GIS Render Container (Fallback) */}
            <div className="flex justify-center" id="googleSignInBtnDiv"></div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Hoặc nhập nhanh Gmail</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* 2. DIRECT GMAIL FORM */}
          <form onSubmit={handleQuickGmailLogin} className="space-y-3">
            <div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="VD: tenban@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>Vào Danh Mục Với Gmail Này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Cross-Device Sync Feature Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Tự Động Đồng Bộ Mọi Thiết Bị
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-200"><Laptop className="w-3.5 h-3.5 text-indigo-400" /> Máy tính</span>
              <span className="text-emerald-400 font-bold">⇆</span>
              <span className="flex items-center gap-1 text-slate-200"><Smartphone className="w-3.5 h-3.5 text-teal-400" /> Điện thoại</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Tài khoản Google của bạn được cấp một không gian lưu trữ riêng biệt. Mọi thay đổi mua bán sẽ đồng bộ ngay giữa máy tính và điện thoại.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
