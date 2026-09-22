import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Shield,
  FileText,
  Banknote,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  PlusCircle,
  Tag,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, InstallmentContract } from '../types';

export const CustomerProfileModal: React.FC = () => {
  const {
    selectedProfileCustomer,
    setSelectedProfileCustomer,
    contracts,
    companySettings,
    payInstallment,
    setActiveReceiptForPrint,
    openNewContractModal
  } = useApp();

  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  // Direct payment state inside customer profile
  const [payingContract, setPayingContract] = useState<InstallmentContract | null>(null);
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(null);
  const [payingAmount, setPayingAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);

  if (!selectedProfileCustomer) return null;

  const customer = selectedProfileCustomer;
  const customerContracts = contracts.filter((c) => c.customerId === customer.id);

  // Financial statistics for this customer
  const totalOriginal = customerContracts.reduce((sum, c) => sum + c.originalAmount, 0);
  const totalWithProfit = customerContracts.reduce((sum, c) => sum + c.totalWithProfit, 0);
  const totalPaid = customerContracts.reduce((sum, c) => sum + c.totalPaid, 0);
  const totalRemaining = customerContracts.reduce((sum, c) => sum + c.remainingBalance, 0);

  const activeContracts = customerContracts.filter((c) => c.status === 'active');
  const completedContracts = customerContracts.filter((c) => c.status === 'completed');

  // Overdue count and amount for this customer
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  let overdueInstallmentsCount = 0;
  let overdueInstallmentsAmount = 0;

  activeContracts.forEach((c) => {
    c.schedule.forEach((inst) => {
      if (inst.status !== 'paid') {
        const d = new Date(inst.dueDate);
        if (d <= today) {
          overdueInstallmentsCount++;
          overdueInstallmentsAmount += (inst.amount - (inst.paidAmount || 0));
        }
      }
    });
  });

  const handleOpenPay = (contract: InstallmentContract, installmentId: string) => {
    const inst = contract.schedule.find((i) => i.id === installmentId);
    if (!inst) return;
    setPayingContract(contract);
    setPayingInstallmentId(installmentId);
    setPayingAmount(inst.amount - (inst.paidAmount || 0));
    setPaymentMethod('cash');
    setPayNotes(`تسديد القسط رقم ${inst.installmentNumber}`);
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingContract || !payingInstallmentId || payingAmount <= 0) return;

    setIsPaying(true);
    const inst = payingContract.schedule.find(i => i.id === payingInstallmentId);
    const originalAmt = inst ? inst.amount - (inst.paidAmount || 0) : payingAmount;
    const unpaidDiff = Math.max(0, originalAmt - payingAmount);

    let notes = payNotes.trim();
    if (unpaidDiff > 0) {
      notes = `${notes ? notes + ' | ' : ''}تسديد ${payingAmount.toLocaleString()} د.ع وترحيل متبقي ${unpaidDiff.toLocaleString()} د.ع صافي بدون فوائد`;
    }

    const res = await payInstallment(payingContract.id, payingInstallmentId, {
      paidAmount: payingAmount,
      paymentMethod,
      notes,
      rolloverMode: 'rollover_to_balance'
    });
    setIsPaying(false);

    if (res.success) {
      if (res.receipt) {
        setActiveReceiptForPrint(res.receipt);
      }
      setPayingContract(null);
      setPayingInstallmentId(null);
    } else {
      alert(res.error || 'حدث خطأ أثناء تسجيل الدفعة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white ring-2 ring-white/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">{customer.name}</h3>
                <span className="bg-blue-500/30 text-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  ملف الزبون
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-3 font-mono">
                <span>{customer.phone}</span>
                <span>•</span>
                <span>هوية: {customer.idNumber || 'غير مسجلة'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedProfileCustomer(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Top Quick Status & Overdue Alert */}
          {overdueInstallmentsCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-rose-800">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                <div className="text-xs">
                  <div className="font-bold">
                    تنبيه: العميل عليه ({overdueInstallmentsCount}) قسط متأخر عن موعد السداد!
                  </div>
                  <div className="text-[11px] text-rose-600 font-mono mt-0.5">
                    إجمالي المبلغ المتأخر المستحق: {overdueInstallmentsAmount.toLocaleString()} {companySettings.currencySymbol}
                  </div>
                </div>
              </div>
              <span className="bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-lg">
                مطلوب فوري
              </span>
            </div>
          )}

          {/* Customer Profile Info & Guarantor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Personal Details */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>البيانات الشخصية للزبون</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">رقم الهاتف:</span>
                  <span className="font-bold font-mono text-slate-800">{customer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">رقم الهوية / الأحوال:</span>
                  <span className="font-bold font-mono text-slate-800">{customer.idNumber || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">عنوان السكن:</span>
                  <span className="font-medium text-slate-700">{customer.address || '-'}</span>
                </div>
                {customer.notes && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">ملاحظات:</span>
                    <span className="text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded-md block border border-slate-100">
                      {customer.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantor Details */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>بيانات الكفيل الضامن</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">اسم الكفيل:</span>
                  <span className="font-bold text-slate-800">{customer.guarantorName || 'لا يوجد كفيل'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">هاتف الكفيل:</span>
                  <span className="font-bold font-mono text-slate-800">{customer.guarantorPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">وظيفة / عمل الكفيل:</span>
                  <span className="font-medium text-slate-700">{customer.guarantorJob || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">عنوان الكفيل:</span>
                  <span className="font-medium text-slate-700">{customer.guarantorAddress || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Financial Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-bold">إجمالي العقود والأجهزة</div>
              <div className="text-base sm:text-lg font-black text-slate-800 mt-1 font-mono">
                {customerContracts.length} عقد
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                ({activeContracts.length} نشط • {completedContracts.length} منتهي)
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-bold">إجمالي قيمة التمويل</div>
              <div className="text-base sm:text-lg font-black text-blue-700 mt-1 font-mono">
                {totalWithProfit.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{companySettings.currencySymbol}</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-bold">إجمالي ما سدده الزبون</div>
              <div className="text-base sm:text-lg font-black text-emerald-600 mt-1 font-mono">
                {totalPaid.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{companySettings.currencySymbol}</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="text-[11px] text-slate-400 font-bold">المتبقي بذمة الزبون</div>
              <div className={`text-base sm:text-lg font-black mt-1 font-mono ${totalRemaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {totalRemaining.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{companySettings.currencySymbol}</div>
            </div>
          </div>

          {/* Section: All Devices, Goods & Loans History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>سجل تفصيلي بكافة الأجهزة والسلع والقروض السابقة والنشطة ({customerContracts.length})</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProfileCustomer(null);
                    openNewContractModal('installment', customer.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>عقد جديد لهذا الزبون</span>
                </button>
              </div>
            </div>

            {customerContracts.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
                لا توجد عقود أو أقساط مسجلة لهذا العميل حتى الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {customerContracts.map((contract) => {
                  const isExpanded = expandedContractId === contract.id;
                  const isCompleted = contract.status === 'completed';
                  const paidCount = contract.schedule.filter((i) => i.status === 'paid').length;
                  const remainingCount = contract.schedule.length - paidCount;

                  return (
                    <div
                      key={contract.id}
                      className={`bg-white rounded-xl border transition-all overflow-hidden ${
                        isCompleted
                          ? 'border-slate-200 bg-slate-50/40'
                          : 'border-blue-200 shadow-2xs'
                      }`}
                    >
                      {/* Contract Summary Bar */}
                      <div
                        onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              contract.type === 'cash_loan'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {contract.type === 'cash_loan' ? (
                              <Banknote className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {contract.itemNameOrDescription}
                              </span>

                              {contract.department && (
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                  <Tag className="w-2.5 h-2.5 text-blue-500" />
                                  {contract.department}
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isCompleted ? 'مكتمل ومسدد بالكامل' : 'عقد نشط'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1 font-mono">
                              <span>عقد: {contract.contractNumber}</span>
                              <span>•</span>
                              <span>بدء: {contract.startDate}</span>
                              <span>•</span>
                              <span>المدة: {contract.durationMonths} شهر</span>
                              <span>•</span>
                              <span>القسط: {contract.monthlyInstallment.toLocaleString()} {companySettings.currencySymbol}</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial figures & Expand Arrow */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          <div className="text-right text-xs">
                            <div className="text-[10px] text-slate-400">المتبقي للسداد</div>
                            <div
                              className={`font-black font-mono text-sm ${
                                contract.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {contract.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              (مسدد: {paidCount} من {contract.schedule.length})
                            </div>
                          </div>

                          <div className="text-slate-400">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Installments Schedule & Direct Payment */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">
                              جدول الأقساط الشهرية لهذا العقد (المتبقي: {remainingCount} قسط)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              الإجمالي الكلي: {contract.totalWithProfit.toLocaleString()} {companySettings.currencySymbol}
                            </span>
                          </div>

                          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                            <table className="w-full text-right text-xs">
                              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="py-2.5 px-3">رقم القسط</th>
                                  <th className="py-2.5 px-3">تاريخ الاستحقاق</th>
                                  <th className="py-2.5 px-3">مبلغ القسط</th>
                                  <th className="py-2.5 px-3">المسدد</th>
                                  <th className="py-2.5 px-3">حالة السداد</th>
                                  <th className="py-2.5 px-3 text-center">إجراء السداد</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {contract.schedule.map((inst) => {
                                  const isPaid = inst.status === 'paid';
                                  const isOverdue = !isPaid && new Date(inst.dueDate) <= today;

                                  return (
                                    <tr
                                      key={inst.id}
                                      className={`hover:bg-slate-50 ${
                                        isPaid
                                          ? 'bg-emerald-50/30'
                                          : isOverdue
                                          ? 'bg-rose-50/50'
                                          : ''
                                      }`}
                                    >
                                      <td className="py-2 px-3 font-mono font-bold text-slate-800">
                                        قسط #{inst.installmentNumber}
                                      </td>
                                      <td className="py-2 px-3 font-mono">
                                        <div className="flex items-center gap-1.5">
                                          <span>{inst.dueDate}</span>
                                          {isOverdue && (
                                            <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-sm animate-pulse">
                                              متأخر
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                        {inst.amount.toLocaleString()} {companySettings.currencySymbol}
                                      </td>
                                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                                        {inst.paidAmount > 0
                                          ? `${inst.paidAmount.toLocaleString()} ${companySettings.currencySymbol}`
                                          : '-'}
                                      </td>
                                      <td className="py-2 px-3">
                                        {isPaid ? (
                                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            تم التسديد ({inst.paidDate})
                                          </span>
                                        ) : isOverdue ? (
                                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                            متأخر الاستحقاق
                                          </span>
                                        ) : (
                                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            بانتظار السداد
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {!isPaid ? (
                                          <button
                                            onClick={() => handleOpenPay(contract, inst.id)}
                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                          >
                                            <CreditCard className="w-3 h-3" />
                                            <span>تسديد الآن</span>
                                          </button>
                                        ) : (
                                          <span className="text-slate-400 text-[11px] font-mono">
                                            وصل: {inst.receiptNumber || 'مسجل'}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            رقم سجل العميل: {customer.id}
          </div>
          <button
            onClick={() => setSelectedProfileCustomer(null)}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
          >
            إغلاق الملف
          </button>
        </div>
      </div>

      {/* Direct Payment Dialog inside Customer Profile */}
      {payingContract && payingInstallmentId && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>تسجيل دفعة وقبض قسط للزبون</span>
              </h4>
              <button
                onClick={() => {
                  setPayingContract(null);
                  setPayingInstallmentId(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">الزبون: <span className="font-bold text-slate-900">{customer.name}</span></div>
                <div className="text-slate-500">العقد: <span className="font-bold font-mono text-slate-900">{payingContract.contractNumber}</span> ({payingContract.itemNameOrDescription})</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المقبوض نقداً *</label>
                <input
                  type="number"
                  value={payingAmount}
                  onChange={(e) => setPayingAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 text-slate-900 text-sm font-bold font-mono rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {(() => {
                const selInst = payingContract.schedule.find(i => i.id === payingInstallmentId);
                const reqAmt = selInst ? selInst.amount - (selInst.paidAmount || 0) : 0;
                const diff = Math.max(0, reqAmt - payingAmount);
                if (diff > 0) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-[11px] leading-relaxed">
                      <strong>🔄 ترحيل مالي صافي بدون فوائد:</strong> سيتم ترحيل مبلغ ({diff.toLocaleString()} د.ع) تلقائياً ليُضاف إلى إجمالي المتبقي بذمة الزبون بشكل صافي بدون أي فوائد إضافية، واعتبار قسط هذا الشهر مسدداً.
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 font-bold"
                >
                  <option value="cash">نقداً (كاش في الصندوق)</option>
                  <option value="zain_cash">زين كاش (Zain Cash)</option>
                  <option value="qi_card">بطاقة الماستر / كي كارد (Qi Card)</option>
                  <option value="bank_transfer">حوالة مصرفية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الوصل</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2 border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {isPaying ? 'جارِ الحفظ والطباعة...' : 'تأكيد القبض وإصدار الوصل'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPayingContract(null);
                    setPayingInstallmentId(null);
                  }}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
