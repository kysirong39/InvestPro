import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Server, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  HelpCircle,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { testApiConnection, getApiSettings, saveApiSettings } from '../services/marketPriceService';

export const ApiSettingsModal = ({ 
  isOpen, 
  onClose, 
  onSaveSettings 
}) => {
  const [settings, setSettings] = useState(() => getApiSettings());
  const [testingSource, setTestingSource] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTest = async (source) => {
    setTestingSource(source);
    setTestResult(null);
    try {
      const res = await testApiConnection(source, settings.customEndpointUrl);
      setTestResult({
        source,
        ...res
      });
    } catch (e) {
      setTestResult({
        source,
        success: false,
        message: 'Lỗi không xác định khi kết nối'
      });
    } finally {
      setTestingSource(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveApiSettings(settings);
    if (onSaveSettings) onSaveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Cấu Hình Nguồn Dữ Liệu Giá Thị Trường (API Settings)
              </h3>
              <p className="text-xs text-slate-400">
                Lựa chọn nhà cung cấp dữ liệu giá cổ phiếu và kiểm tra độ ổn định kết nối
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Choose Primary Source */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>1. Chọn Nguồn Dữ Liệu Chính (Primary Source)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* DNSE / Entrade */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, primarySource: 'DNSE' }))}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  settings.primarySource === 'DNSE'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <strong className="text-sm font-bold text-white">DNSE / Entrade Market</strong>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Khuyến Nghị (CORS OK)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  API mở 100% CORS cho trình duyệt. Cung cấp đầy đủ giá khớp lệnh HOSE, HNX, UPCOM.
                </p>
                <button
                  type="button"
                  disabled={testingSource === 'DNSE'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTest('DNSE');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 hover:border-emerald-500 text-[11px] text-slate-300 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-all"
                >
                  <Zap className={`w-3 h-3 ${testingSource === 'DNSE' ? 'animate-spin' : ''}`} />
                  <span>{testingSource === 'DNSE' ? 'Đang test...' : '⚡ Test Kết Nối'}</span>
                </button>
              </div>

              {/* VNDIRECT */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, primarySource: 'VNDIRECT' }))}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  settings.primarySource === 'VNDIRECT'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
                    <strong className="text-sm font-bold text-white">VNDIRECT Finfo v4</strong>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Dữ liệu khớp lệnh
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  API bảng giá VNDIRECT. (Lưu ý: Có thể bị giới hạn CORS trên một số trình duyệt).
                </p>
                <button
                  type="button"
                  disabled={testingSource === 'VNDIRECT'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTest('VNDIRECT');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 hover:border-indigo-500 text-[11px] text-slate-300 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-all"
                >
                  <Zap className={`w-3 h-3 ${testingSource === 'VNDIRECT' ? 'animate-spin' : ''}`} />
                  <span>{testingSource === 'VNDIRECT' ? 'Đang test...' : '⚡ Test Kết Nối'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Test Connection Banner */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
              testResult.success 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block font-bold">
                  {testResult.success ? 'Kiểm tra thành công!' : 'Kết nối thất bại / Bị chặn CORS'}
                </strong>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Section 2: Fallback & Advanced Options */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>2. Cơ Chế An Toàn & Tự Động Chuyển Nguồn Dự Phòng</span>
            </h4>

            {/* Enable Fallback Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Tự động chuyển nguồn dự phòng khi có lỗi</span>
                <span className="text-[11px] text-slate-400">Nếu nguồn VNDIRECT không phản hồi, hệ thống sẽ tự quét DNSE hoặc Binance</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableFallback}
                onChange={(e) => setSettings(prev => ({ ...prev, enableFallback: e.target.checked }))}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Fallback to Manual Editing Guarantee */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Chế độ Sửa Tay Thủ Công luôn sẵn sàng:</strong> Bất cứ khi nào API không phản hồi hoặc ngoài giờ giao dịch, bạn chỉ cần bấm nút <strong>"Sửa"</strong> hoặc <strong>gõ trực tiếp vào ô giá trên bảng</strong> để điều chỉnh giá theo ý muốn mà không bao giờ bị mất dữ liệu.
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {savedSuccess && <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Đã lưu cài đặt!</span>}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Đóng
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu Hình Nguồn API</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
