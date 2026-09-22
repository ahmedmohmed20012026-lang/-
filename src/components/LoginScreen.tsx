import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Building,
  KeyRound,
  AlertCircle,
  Wifi,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, companySettings, networkInfo } = useApp();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const primaryIp = networkInfo?.localIpAddresses?.[0] || '127.0.0.1';
  const port = networkInfo?.port || 3000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setError('');
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Company / System Branding Card */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/30 ring-4 ring-white/10 mb-2">
            <Building className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            {companySettings.companyName}
          </h1>
          <p className="text-sm text-slate-300">
            نظام إدارة الأقساط والقروض النقدية والمبيعات
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-emerald-400 font-mono mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>الخادم المحلي (LAN): {primaryIp}:{port}</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span>تسجيل الدخول للنظام</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                أدخل بيانات حسابك للمتابعة والصلاحيات
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
              آمن ومحمي
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: admin أو sales"
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl pr-10 pl-4 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl pr-10 pl-4 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span>جاري التحقق والدخول...</span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Buttons */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">
              حسابات النظام الافتراضية للتجربة السريعة:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="text-right p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">👑 مدير النظام</div>
                <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sales', '123456')}
                className="text-right p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">💼 موظف مبيعات</div>
                <div className="text-[10px] text-slate-500 font-mono">sales / 123456</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-6">
          نظام محلي مستقل ومحمي • جاهز للعمل على الشبكة الداخلية والراوتر
        </div>
      </div>
    </div>
  );
};
