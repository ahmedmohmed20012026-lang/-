import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  User,
  Shield,
  Clock,
  DollarSign,
  AlertOctagon,
  RefreshCw,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditTrailManager: React.FC = () => {
  const { auditLogs, companySettings,  refreshData} = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'all' || log.actionType === filterAction;

    return matchesSearch && matchesFilter;
  });

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'pay_installment':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            سداد قسط
          </span>
        );
      case 'create_contract':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            إنشاء عقد / تمويل
          </span>
        );
      case 'create_customer':
        return (
          <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
            إضافة عميل
          </span>
        );
      case 'update_customer':
        return (
          <span className="bg-cyan-100 text-cyan-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-200">
            تعديل عميل
          </span>
        );
      case 'delete_customer':
        return (
          <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
            حذف عميل
          </span>
        );
      case 'delete_all_customers':
        return (
          <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
            حذف جميع العملاء (حرج)
          </span>
        );
      case 'update_settings':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            تعديل إعدادات
          </span>
        );
      case 'login':
        return (
          <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
            تسجيل دخول
          </span>
        );
      case 'backup_download':
      case 'restore_database':
        return (
          <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
            نسخ واسترجاع
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {type}
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>سجل العمليات المحاسبية وحركات الموظفين (Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            توثيق رقمي فوري لجميع حركات السداد، إنشاء العقود، التعديلات، وعمليات النظام الأمنية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث السجل</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة السجل</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالموظف أو تفاصيل الحركة..."
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pr-9 pl-4 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="all">جميع أنواع العمليات</option>
            <option value="pay_installment">تسديد الأقساط</option>
            <option value="create_contract">إنشاء عقود وقروض</option>
            <option value="create_customer">إضافة عملاء</option>
            <option value="update_customer">تعديل عملاء</option>
            <option value="delete_customer">حذف عملاء</option>
            <option value="delete_all_customers">حذف جميع العملاء</option>
            <option value="update_settings">تعديل إعدادات النظام</option>
            <option value="login">تسجيلات الدخول</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-bold mr-auto">
          العدد الإجمالي: {filteredLogs.length} حركة مسجلة
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">الموظف / المنفذ</th>
                <th className="py-3 px-4">نوع الحركة</th>
                <th className="py-3 px-4">تفاصيل البيان</th>
                <th className="py-3 px-4 text-left">المبلغ المالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    لا توجد حركات مسجلة تطابق البحث المحدد
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  const formattedDate = date.toLocaleDateString('ar-IQ', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                  });
                  const formattedTime = date.toLocaleTimeString('ar-IQ', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        <div>{formattedDate}</div>
                        <div className="text-[10px] text-slate-400">{formattedTime}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.userName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.userRole === 'manager' ? 'مدير مسؤول' : 'موظف مبيعات'}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.actionType)}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700 leading-relaxed max-w-md">
                        {log.details}
                      </td>

                      <td className="py-3 px-4 text-left font-mono font-bold whitespace-nowrap">
                        {log.amount ? (
                          <span className="text-emerald-700">
                            {Number(log.amount).toLocaleString()} {companySettings.currencySymbol}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
