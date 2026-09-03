import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { 
  loginWithGmail, 
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

  if (!isOpen) return null;

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

  const handleQuickDomainAppend = () => {
    if (emailInput && !emailInput.includes('@')) {
      setEmailInput(emailInput + '@gmail.com');
    }
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
                <span>Tài Khoản Gmail Cá Nhân</span>
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

        {/* GMAIL LOGIN FORM */}
        <form onSubmit={handleQuickGmailLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Địa Chỉ Gmail Của Bạn
              </label>
              {!emailInput.includes('@') && emailInput.length > 0 && (
                <button
                  type="button"
                  onClick={handleQuickDomainAppend}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5" /> +@gmail.com
                </button>
              )}
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="VD: nguyenvana@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Tên Nhà Đầu Tư / Biệt Danh (Tùy chọn)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="VD: Nguyễn Văn A (Tài khoản chính)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Cross-Device Sync Feature Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Tự Động Đồng Bộ Mọi Thiết Bị
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-200"><Laptop className="w-3.5 h-3.5 text-indigo-400" /> Máy tính</span>
              <span className="text-emerald-400 font-bold">⇆</span>
              <span className="flex items-center gap-1 text-slate-200"><Smartphone className="w-3.5 h-3.5 text-teal-400" /> Điện thoại</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Mỗi tài khoản Gmail có <strong>danh mục riêng biệt 100%</strong>. Khi bạn mở website trên điện thoại và nhập đúng Gmail này, toàn bộ cổ phiếu và tiền mặt sẽ hiển thị đồng bộ ngay lập tức.
            </p>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span>Đăng Nhập & Mở Không Gian Đầu Tư</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
