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
  LogOut
} from 'lucide-react';
import { 
  loginWithGmail, 
  loginWithGoogle, 
  getCurrentUser, 
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

  // Initialize Google Identity Services (GIS) One-Tap / Button if available
  useEffect(() => {
    if (isOpen && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          // Client ID công khai hoặc tự sinh
          client_id: '965842839401-investpro.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const googleBtnContainer = document.getElementById('googleSignInBtnDiv');
        if (googleBtnContainer) {
          window.google.accounts.id.renderButton(googleBtnContainer, {
            theme: 'filled_blue',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            width: 320
          });
        }
      } catch (err) {
        console.warn('GIS init fallback:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Xử lý JWT Token từ Google OAuth
  const handleGoogleCredentialResponse = (response) => {
    try {
      if (response && response.credential) {
        // Decode payload JWT
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
      // Fallback
    }
  };

  const handleQuickGmailLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail hợp lệ (VD: tenban@gmail.com).');
      return;
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
                <span>Đăng Nhập Google / Gmail</span>
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
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentUser.avatarMeta?.gradient || 'from-emerald-500 to-teal-600'} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                {currentUser.avatarMeta?.char || 'U'}
              </div>
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

        {/* 1-CLICK GOOGLE BUTTON DIV */}
        <div className="space-y-4">
          
          {/* Native Google GIS button slot */}
          <div className="flex justify-center" id="googleSignInBtnDiv"></div>

          {/* Quick Gmail Direct Form */}
          <form onSubmit={handleQuickGmailLogin} className="space-y-3.5 pt-2">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nhập Địa Chỉ Gmail Của Bạn
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="VD: trader.invest@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tên Nhà Đầu Tư (Tùy chọn)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="VD: Anh Nam (VIP)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Cross-Device Sync Feature Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" /> Đồng Bộ Đám Mây Mọi Thiết Bị
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Laptop className="w-3 h-3 text-indigo-400" /> Máy tính</span>
                <span>⇆</span>
                <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-teal-400" /> Điện thoại</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Chỉ cần mở website trên điện thoại và nhập đúng Gmail này, toàn bộ danh mục sẽ tự động hiển thị ngay lập tức.
              </p>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>Xác Thực & Đồng Bộ Danh Mục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
