import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Printer,
  FileText,
  Download,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsManager: React.FC = () => {
  const { contracts, receipts, customers, companySettings, setActiveReceiptForPrint } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year'>('all');

  const totalCapitalFinanced = contracts.reduce((sum, c) => sum + (c.originalAmount || 0), 0);
  const totalProfits = contracts.reduce((sum, c) => sum + (c.manualProfitAmount || 0), 0);
  const totalPortfolio = contracts.reduce((sum, c) => sum + (c.totalWithProfit || 0), 0);
  const totalCollected = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalRemaining = contracts.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);

  // Installment contracts vs cash loans breakdown
  const installmentContracts = contracts.filter((c) => c.type === 'installment');
  const cashLoans = contracts.filter((c) => c.type === 'cash_loan');

  const installmentTotal = installmentContracts.reduce((sum, c) => sum + c.totalWithProfit, 0);
  const cashLoanTotal = cashLoans.reduce((sum, c) => sum + c.totalWithProfit, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>التقارير المالية والمحاسبية الشاملة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            كشف حساب السيولة النقدية، حركة تحصيل الأقساط، ونسب الأرباح المحققة
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة التقرير المالي</span>
        </button>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400">إجمالي حجم المحفظة المالية</div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalPortfolio.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">
            {companySettings.currencySymbol} • رأس المال + الأرباح
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400">صافي الأرباح المحتسبة</div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            +{totalProfits.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {companySettings.currencySymbol} • أرباح تمويل التقسيط
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400">إجمالي التحصيلات النقدية</div>
          <div className="text-2xl font-black text-indigo-700 font-mono">
            {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold">
            {companySettings.currencySymbol} • مقبوضات مسددة فعلياً
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400">المتبقي بذمة الزبائن</div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {totalRemaining.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold">
            {companySettings.currencySymbol} • ديون قيد الاستحقاق
          </div>
        </div>
      </div>

      {/* Breakdown by Type: Installment Goods vs Cash Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goods Installments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>تقسيط السلع والأجهزة الإلكترونية</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">
              {installmentContracts.length} عقد
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">إجمالي قيمة العقود:</span>
              <span className="font-bold text-slate-900 font-mono">
                {installmentTotal.toLocaleString()} {companySettings.currencySymbol}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">المسدد منها:</span>
              <span className="font-bold text-emerald-600 font-mono">
                {installmentContracts.reduce((sum, c) => sum + c.totalPaid, 0).toLocaleString()} {companySettings.currencySymbol}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">المتبقي للتحصيل:</span>
              <span className="font-bold text-rose-600 font-mono">
                {installmentContracts.reduce((sum, c) => sum + c.remainingBalance, 0).toLocaleString()} {companySettings.currencySymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Cash Loans */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>القروض والتمويلات النقدية المباشرة</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
              {cashLoans.length} قرض
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">إجمالي مبالغ القروض مع الفائدة:</span>
              <span className="font-bold text-slate-900 font-mono">
                {cashLoanTotal.toLocaleString()} {companySettings.currencySymbol}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">المسدد منها:</span>
              <span className="font-bold text-emerald-600 font-mono">
                {cashLoans.reduce((sum, c) => sum + c.totalPaid, 0).toLocaleString()} {companySettings.currencySymbol}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">المتبقي للتحصيل:</span>
              <span className="font-bold text-rose-600 font-mono">
                {cashLoans.reduce((sum, c) => sum + c.remainingBalance, 0).toLocaleString()} {companySettings.currencySymbol}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>كشف حركة المقبوضات وإيصالات الصندوق الأخيرة</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold font-mono">
            {receipts.length} حركة تحصيل
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">رقم الوصل</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">اسم العميل</th>
                <th className="py-3 px-4">رقم العقد والقسط</th>
                <th className="py-3 px-4">المحصل / الصندوق</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4 text-left">المبلغ المسدد</th>
                <th className="py-3 px-4 text-center">طباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {r.receiptNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {r.paymentDate}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {r.customerName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {r.contractNumber} (قسط #{r.installmentNumber})
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {r.collectedBy}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {r.paymentMethod === 'cash' ? 'كاش نقداً' : 'دفع إلكتروني'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-700">
                    {r.amount.toLocaleString()} {companySettings.currencySymbol}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setActiveReceiptForPrint(r)}
                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      title="طباعة الوصل"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
