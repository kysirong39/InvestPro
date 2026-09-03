import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  LogOut, 
  Trash2, 
  UserPlus, 
  Layers,
  Lock
} from 'lucide-react';
import { 
  loginWithGmail, 
  getKnownAccounts, 
  switchAccount, 
  removeKnownAccount 
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
  const [knownAccounts, setKnownAccounts] = useState(getKnownAccounts());

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail hoặc Email hợp lệ.');
      return;
    }

    try {
      const user = loginWithGmail(cleanEmail, nameInput.trim());
      onUserChanged(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đăng nhập.');
    }
  };

  const handleSwitch = (userId) => {
    try {
      const user = switchAccount(userId);
      onUserChanged(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi chuyển đổi tài khoản.');
    }
  };

  const handleRemoveAccount = (e, userId) => {
    e.stopPropagation();
    if (window.confirm('Xác nhận xóa tài khoản này khỏi danh sách ghi nhớ trên máy?')) {
      const updatedUser = removeKnownAccount(userId);
      setKnownAccounts(getKnownAccounts());
      if (updatedUser.id !== currentUser.id) {
        onUserChanged(updatedUser);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-slate-700/90 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Tài Khoản Cá Nhân</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Gmail / Google
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý danh mục & tài sản độc lập, bảo mật cho từng cá nhân
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Status */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentUser.avatarMeta?.gradient || 'from-indigo-500 to-purple-600'} flex items-center justify-center font-black text-white text-base shrink-0 shadow-md`}>
              {currentUser.avatarMeta?.char || 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Đang Đăng Nhập:</span>
              <div className="font-extrabold text-sm text-white truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
            </div>
          </div>

          <div className="shrink-0">
            {currentUser.isGuest ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Tài khoản Khách
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đã kết nối
              </span>
            )}
          </div>
        </div>

        {/* PREVIOUS SAVED ACCOUNTS ON THIS DEVICE */}
        {knownAccounts.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span>Tài khoản đã lưu trên máy này:</span>
              <span className="text-[11px] text-slate-500">Bấm để chuyển nhanh</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {knownAccounts.map((acc) => {
                const isCurrent = acc.id === currentUser.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSwitch(acc.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCurrent 
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/30' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${acc.avatarMeta?.gradient || 'from-blue-500 to-indigo-600'} flex items-center justify-center font-bold text-white text-xs shrink-0`}>
                        {acc.avatarMeta?.char || acc.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{acc.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{acc.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                          Đang dùng
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(e, acc.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Xóa khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOGIN FORM WITH GMAIL */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đăng Nhập / Thêm Tài Khoản Gmail Mới</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Địa Chỉ Gmail / Email Cá Nhân
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="VD: nguyenvana@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Họ Tên / Biệt Danh Nhà Đầu Tư (Tùy chọn)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="VD: Nguyễn Văn A (Tài khoản chính)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Privacy Guarantee Badge */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Toàn bộ danh mục đầu tư, tiền mặt và lịch sử lệnh được phân vùng lưu trữ <strong className="text-slate-200">hoàn toàn riêng biệt</strong> theo từng địa chỉ Gmail. Bạn có thể tạo nhiều tài khoản trên cùng một máy mà không sợ bị lẫn số liệu.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
          >
            <span>Đăng Nhập Vào Không Gian Đầu Tư</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
