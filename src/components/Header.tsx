import React, { useState, useRef, useEffect } from 'react';
import {
  Building,
  Search,
  Download,
  Bell,
  LogOut,
  User,
  Phone,
  ArrowLeft,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    companySettings,
    currentUser,
    logout,
    networkInfo,
    setIsLanModalOpen,
    contracts,
    customers,
    setIsOverdueAlertsModalOpen,
    setActiveTab,
    globalSearch,
    setGlobalSearch,
    openCustomerProfile,
    downloadBackup
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Calculate overdue count
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  let overdueCount = 0;
  contracts.forEach((c) => {
    if (c.status === 'completed') return;
    c.schedule.forEach((inst) => {
      if (inst.status !== 'paid') {
        const d = new Date(inst.dueDate);
        if (d <= today) {
          overdueCount++;
        }
      }
    });
  });

  // Real-time search suggestions
  const searchResults = globalSearch.trim().length > 0
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
          c.phone.includes(globalSearch.trim()) ||
          c.idNumber.includes(globalSearch.trim())
      ).slice(0, 5)
    : [];

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomerFromSearch = (customer: any) => {
    openCustomerProfile(customer);
    setIsSearchFocused(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-50">
              <Building className="w-6 h-6" />
            </div>

            <div>
              <h1 className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
                {companySettings.companyName}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-500 font-medium">
                  نظام إدارة الأقساط والقروض
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <button
                  onClick={() => setIsLanModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold"
                  title="حالة الشبكة المحلية LAN"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LAN: {networkInfo?.localIpAddresses?.[0] || '127.0.0.1'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center: Global Real-time Search */}
          <div className="flex-1 max-w-md relative hidden md:block" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="بحث فوري سريع عن عميل بالاسم أو رقم الهاتف أو الهوية..."
                className="w-full bg-slate-100 text-slate-900 text-xs rounded-xl pr-10 pl-8 py-2.5 border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all font-medium"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="text-slate-400 hover:text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown Suggestions */}
            {isSearchFocused && globalSearch.trim().length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 border-b border-slate-100">
                  نتائج البحث للعملاء ({searchResults.length})
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    لا يوجد عميل يطابق هذا البحث
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomerFromSearch(cust.id)}
                        className="p-3 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{cust.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{cust.phone}</span>
                            </span>
                            <span>•</span>
                            <span>الهوية: {cust.idNumber}</span>
                          </div>
                        </div>

                        <div className="text-blue-600 font-bold flex items-center gap-1 text-[11px]">
                          <span>عرض الحساب</span>
                          <ArrowLeft className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions & User Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Backup for Manager */}
            {currentUser?.role === 'manager' && (
              <button
                onClick={downloadBackup}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                title="تنزيل نسخة احتياطية فورية من كافة بيانات النظام"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">نسخ احتياطي سريع</span>
              </button>
            )}

            {/* Alerts Bell */}
            <button
              onClick={() => setIsOverdueAlertsModalOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="تنبيهات الاستحقاق والتأخير"
            >
              <Bell className="w-5 h-5" />
              {overdueCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {overdueCount > 9 ? '9+' : overdueCount}
                </span>
              )}
            </button>

            {/* User Info & Role Badge */}
            <div className="hidden lg:flex items-center gap-2.5 border-r border-slate-200 pr-3 mr-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'مستخدم النظام'}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {currentUser?.role === 'manager' ? (
                    <span className="text-amber-700 font-bold">👑 مدير النظام</span>
                  ) : (
                    <span className="text-blue-700 font-bold">💼 مبيعات ومحاسبة</span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="تسجيل الخروج من الحساب"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
