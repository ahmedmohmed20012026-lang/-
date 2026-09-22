import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Users,
  BarChart3,
  History,
  Settings,
  Wifi
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, contracts, customers } = useApp();

  const activeContractsCount = contracts.filter((c) => c.status === 'active').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = contracts
    .filter((c) => c.status === 'active')
    .reduce(
      (sum, c) =>
        sum +
        c.schedule.filter((i) => i.status !== 'paid' && i.dueDate < todayStr).length,
      0
    );

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة القيادة والمؤشرات',
      icon: LayoutDashboard
    },
    {
      id: 'payments',
      label: 'لوحة التسديد',
      icon: CreditCard,
      badge: overdueCount > 0 ? `${overdueCount} متأخر` : undefined,
      isAlertBadge: overdueCount > 0
    },
    {
      id: 'contracts',
      label: 'العقود والأقساط والقروض',
      icon: FileText,
      badge: activeContractsCount > 0 ? activeContractsCount : undefined
    },
    {
      id: 'customers',
      label: 'العملاء والحسابات',
      icon: Users,
      badge: customers.length > 0 ? customers.length : undefined
    },
    {
      id: 'reports',
      label: 'التقارير المالية والتحصيل',
      icon: BarChart3
    },
    ...(currentUser?.role === 'manager'
      ? [
          {
            id: 'audit',
            label: 'سجل العمليات (Audit)',
            icon: History
          },
          {
            id: 'settings',
            label: 'إعدادات النظام والشركة',
            icon: Settings
          }
        ]
      : []),
    {
      id: 'lan',
      label: 'الشبكة المحلية (LAN)',
      icon: Wifi
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-reverse space-x-1 sm:space-x-2 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      item.isAlertBadge
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
