import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Phone,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  ArrowLeft,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OverdueAlertsModal: React.FC = () => {
  const {
    contracts,
    companySettings,
    isOverdueAlertsModalOpen,
    setIsOverdueAlertsModalOpen,
    payInstallment,
    setActiveReceiptForPrint
  } = useApp();

  const [payingItem, setPayingItem] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOverdueAlertsModalOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  // Collect overdue and due-today installments across all active contracts
  const overdueList: any[] = [];
  const dueTodayList: any[] = [];

  contracts.forEach((contract) => {
    if (contract.status === 'completed') return;

    contract.schedule.forEach((inst) => {
      if (inst.status === 'paid') return;

      const dueDate = new Date(inst.dueDate);
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const itemData = {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        contractType: contract.type,
        customerId: contract.customerId,
        customerName: contract.customerName,
        customerPhone: contract.customerPhone,
        installmentId: inst.id,
        installmentNumber: inst.installmentNumber,
        dueDate: inst.dueDate,
        amount: inst.amount - (inst.paidAmount || 0),
        diffDays
      };

      if (diffDays > 0) {
        overdueList.push(itemData);
      } else if (diffDays === 0) {
        dueTodayList.push(itemData);
      }
    });
  });

  // Sort by days overdue descending
  overdueList.sort((a, b) => b.diffDays - a.diffDays);

  const handleQuickPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingItem) return;

    setIsProcessing(true);
    const res = await payInstallment(payingItem.contractId, payingItem.installmentId, {
      paidAmount: payingItem.amount,
      paymentMethod,
      notes: payNotes || `سداد قسط مستحق عبر شاشة التنبيهات`
    });
    setIsProcessing(false);

    if (res.success && res.receipt) {
      setPayingItem(null);
      setActiveReceiptForPrint(res.receipt);
    } else {
      alert(res.error || 'تعذر تسجيل السداد');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                مركز تنبيهات الأقساط المستحقة والمتأخرة
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                تتبع مواعيد استحقاق اليوم والمطالبات المالية المتأخرة للاتصال والتحصيل
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOverdueAlertsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-800">أقساط متأخرة عن موعدها</div>
                <div className="text-2xl font-black text-rose-900 mt-1">{overdueList.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-200/60 text-rose-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-800">أقساط تستحق اليوم</div>
                <div className="text-2xl font-black text-amber-900 mt-1">{dueTodayList.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Overdue Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>الأقساط المتأخرة ({overdueList.length})</span>
            </h4>

            {overdueList.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs text-center">
                لا توجد أي أقساط متأخرة حالياً، مؤشرات السداد ممتازة!
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الهاتف</th>
                      <th className="py-2.5 px-3">العقد والقسط</th>
                      <th className="py-2.5 px-3">تاريخ الاستحقاق</th>
                      <th className="py-2.5 px-3">أيام التأخير</th>
                      <th className="py-2.5 px-3">المبلغ المستحق</th>
                      <th className="py-2.5 px-3 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueList.map((item) => (
                      <tr key={item.installmentId} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {item.customerName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          <a
                            href={`tel:${item.customerPhone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{item.customerPhone}</span>
                          </a>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[11px] text-slate-600">
                            {item.contractNumber} (قسط #{item.installmentNumber})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {item.dueDate}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full text-[11px]">
                            تأخر {item.diffDays} يوم
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                          {item.amount.toLocaleString()} {companySettings.currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setPayingItem(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-xs"
                          >
                            تسديد فوري
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Due Today Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>أقساط تستحق اليوم ({dueTodayList.length})</span>
            </h4>

            {dueTodayList.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs text-center">
                لا توجد أقساط مستحقة لليوم الحالي.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الهاتف</th>
                      <th className="py-2.5 px-3">العقد والقسط</th>
                      <th className="py-2.5 px-3">المبلغ المستحق</th>
                      <th className="py-2.5 px-3 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dueTodayList.map((item) => (
                      <tr key={item.installmentId} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {item.customerName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          <a
                            href={`tel:${item.customerPhone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{item.customerPhone}</span>
                          </a>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {item.contractNumber} (قسط #{item.installmentNumber})
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                          {item.amount.toLocaleString()} {companySettings.currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setPayingItem(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-xs"
                          >
                            تسديد الآن
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsOverdueAlertsModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Nested Quick Pay Modal */}
      {payingItem && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900">
                تسديد قسط فوري للعميل: {payingItem.customerName}
              </h4>
              <button
                onClick={() => setPayingItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div>
                <strong>العقد:</strong> {payingItem.contractNumber} - قسط رقم #{payingItem.installmentNumber}
              </div>
              <div>
                <strong>المبلغ المطلوب:</strong> {payingItem.amount.toLocaleString()} {companySettings.currencySymbol}
              </div>
            </div>

            <form onSubmit={handleQuickPay} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  طريقة الدفع
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="cash">نقداً (كاش بالصندوق)</option>
                  <option value="card">بطاقة دفع إلكتروني (كي كارد / ماستر)</option>
                  <option value="bank_transfer">حوالة مصرفية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات السداد (اختياري)
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="مثال: استلام يدوي من الزبون"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPayingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'جاري السداد...' : 'تأكيد السداد وطباعة الوصل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
