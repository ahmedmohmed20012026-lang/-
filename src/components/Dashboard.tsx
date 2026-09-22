import React from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Banknote,
  PlusCircle,
  ArrowUpRight,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const {
    contracts,
    customers,
    receipts,
    companySettings,
    setActiveTab,
    openNewContractModal,
    setIsOverdueAlertsModalOpen,
    setActiveReceiptForPrint
  } = useApp();

  // Financial calculations
  const totalCapitalFinanced = contracts.reduce((sum, c) => sum + (c.originalAmount || 0), 0);
  const totalProfitProjected = contracts.reduce((sum, c) => sum + (c.manualProfitAmount || 0), 0);
  const totalPortfolioValue = contracts.reduce((sum, c) => sum + (c.totalWithProfit || 0), 0);
  const totalCollections = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalRemaining = contracts.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);

  const activeContracts = contracts.filter((c) => c.status === 'active');
  const completedContracts = contracts.filter((c) => c.status === 'completed');

  // Overdue count calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  let overdueCount = 0;
  let dueTodayCount = 0;
  contracts.forEach((c) => {
    if (c.status === 'completed') return;
    c.schedule.forEach((inst) => {
      if (inst.status !== 'paid') {
        const d = new Date(inst.dueDate);
        if (d < today) overdueCount++;
        else if (inst.dueDate === todayStr) dueTodayCount++;
      }
    });
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Overdue Warning Alert Banner if any */}
      {(overdueCount > 0 || dueTodayCount > 0) && (
        <div
          onClick={() => setIsOverdueAlertsModalOpen(true)}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">
                توجد مطالبات مالية مستحقة التحصيل: ({overdueCount}) قسط متأخر، و ({dueTodayCount}) قسط يستحق اليوم
              </div>
              <div className="text-xs text-amber-100 mt-0.5">
                اضغط هنا لفتح مركز التنبيهات وإجراء الاتصال بالعملاء أو تسجيل السداد الفوري
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
            <span>عرض التنبيهات</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Financed Capital */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">رأس المال الممول</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalCapitalFinanced.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {companySettings.currencySymbol} • أصل التمويل
            </div>
          </div>
        </div>

        {/* Total Profits Projected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الأرباح المضافة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              +{totalProfitProjected.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {companySettings.currencySymbol} • أرباح العقود والقروض
            </div>
          </div>
        </div>

        {/* Collections Received */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المحصل الفعلي (الصندوق)</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-900 font-mono">
              {totalCollections.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {companySettings.currencySymbol} • إجمالي المقبوضات
            </div>
          </div>
        </div>

        {/* Remaining to Collect */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المتبقي بذمة العملاء</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 font-mono">
              {totalRemaining.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {companySettings.currencySymbol} • قيد التحصيل المستقبلي
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-bold text-slate-400">العقود النشطة</div>
          <div className="text-xl font-black text-blue-700 font-mono mt-1">{activeContracts.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-bold text-slate-400">العقود المكتملة</div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">{completedContracts.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-bold text-slate-400">إجمالي الزبائن</div>
          <div className="text-xl font-black text-slate-800 font-mono mt-1">{customers.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <div className="text-xs font-bold text-slate-400">وصولات القبض</div>
          <div className="text-xl font-black text-indigo-700 font-mono mt-1">{receipts.length}</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Contracts & Latest Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contracts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>أحدث عقود التقسيط والقروض النقدية</span>
            </h3>
            <button
              onClick={() => setActiveTab('contracts')}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {contract.contractNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        contract.type === 'cash_loan'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {contract.type === 'cash_loan' ? 'قرض نقدي' : 'تقسيط سلع'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-bold mt-1">
                    {contract.customerName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {contract.itemNameOrDescription}
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs font-black font-mono text-slate-900">
                    {contract.totalWithProfit.toLocaleString()} {companySettings.currencySymbol}
                  </div>
                  <div className="text-[10px] font-bold font-mono text-rose-600 mt-0.5">
                    متبقي: {contract.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Payment Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>أحدث إيصالات القبض والسداد المالي</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {receipts.length} وصل
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {receipts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                لا توجد إيصالات سداد مسجلة حتى الآن
              </div>
            ) : (
              receipts.slice(-5).reverse().map((rec) => (
                <div key={rec.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700">
                        {rec.receiptNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rec.paymentDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-bold mt-1">
                      {rec.customerName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      عقد {rec.contractNumber} • بواسطة: {rec.collectedBy}
                    </div>
                  </div>

                  <div className="text-left flex items-center gap-3">
                    <div>
                      <div className="text-xs font-black font-mono text-emerald-700">
                        +{rec.amount.toLocaleString()} {companySettings.currencySymbol}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rec.paymentMethod === 'cash' ? 'كاش نقدي' : 'إلكتروني'}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveReceiptForPrint(rec)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      title="طباعة إيصال السداد"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
