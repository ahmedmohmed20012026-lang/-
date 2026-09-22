import React, { useState, useMemo } from 'react';
import {
  Banknote,
  Calendar,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  CreditCard,
  User,
  Phone,
  Printer,
  FileText,
  Tag,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Info,
  Check,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstallmentContract, InstallmentItem } from '../types';

export const PaymentBoardManager: React.FC = () => {
  const {
    contracts,
    customers,
    receipts,
    companySettings,
    payInstallment,
    setActiveReceiptForPrint,
    openCustomerProfile,
    currentUser,
    setActiveTab // استيراد setActiveTab لضمان البقاء في شاشة التسديد
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, overdue, today, upcoming
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'customerName'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Requirement 1: Mode toggle to display ONLY the currently due/actionable installment per contract
  const [onlyCurrentDue, setOnlyCurrentDue] = useState<boolean>(true);

  // Requirement 2: Interactive Flexible Payment Modal State
  const [payingContract, setPayingContract] = useState<InstallmentContract | null>(null);
  const [payingInstallment, setPayingInstallment] = useState<InstallmentItem | null>(null);
  const [payingAmount, setPayingAmount] = useState<number>(0);
  const [rolloverMode, setRolloverMode] = useState<'rollover_to_balance' | 'rollover_to_next' | 'partial_keep'>('rollover_to_balance');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  // 1. Calculate Daily Cash Box (صندوق اليومية)
  const todayReceipts = receipts.filter((r) => r.paymentDate === todayStr);
  const todayCollectedAmount = todayReceipts.reduce((sum, r) => sum + r.amount, 0);

  // 2. Prepare Installments List: Focused on Currently Due vs All
  interface DueInstallmentRow {
    contract: InstallmentContract;
    installment: InstallmentItem;
    customerPhone: string;
    isOverdue: boolean;
    daysOverdue: number;
    daysUntilDue: number;
    isDueToday: boolean;
    totalPendingCount: number;
    contractOverdueCount: number;
    totalContractMonths: number;
  }

  const processedInstallments = useMemo(() => {
    const list: DueInstallmentRow[] = [];

    contracts.forEach((contract) => {
      if (contract.status === 'completed') return;

      const unpaid = contract.schedule.filter((inst) => inst.status !== 'paid');
      if (unpaid.length === 0) return;

      // Count overdue installments for this contract
      const contractOverdueCount = unpaid.filter((inst) => {
        const dueDate = new Date(inst.dueDate);
        return today.getTime() - dueDate.getTime() > 0;
      }).length;

      if (onlyCurrentDue) {
        // Pick the current actionable due installment (the earliest unpaid installment)
        const currentTarget = unpaid[0];
        if (currentTarget) {
          const dueDate = new Date(currentTarget.dueDate);
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          const isOverdue = diffDays > 0;
          const isDueToday = currentTarget.dueDate === todayStr;
          const daysOverdue = isOverdue ? diffDays : 0;
          const daysUntilDue = !isOverdue && !isDueToday ? Math.abs(diffDays) : 0;

          list.push({
            contract,
            installment: currentTarget,
            customerPhone: contract.customerPhone,
            isOverdue,
            daysOverdue,
            daysUntilDue,
            isDueToday,
            totalPendingCount: unpaid.length,
            contractOverdueCount,
            totalContractMonths: contract.durationMonths || contract.schedule.length
          });
        }
      } else {
        // Show all remaining installments
        unpaid.forEach((inst) => {
          const dueDate = new Date(inst.dueDate);
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          const isOverdue = diffDays > 0;
          const isDueToday = inst.dueDate === todayStr;
          const daysOverdue = isOverdue ? diffDays : 0;
          const daysUntilDue = !isOverdue && !isDueToday ? Math.abs(diffDays) : 0;

          list.push({
            contract,
            installment: inst,
            customerPhone: contract.customerPhone,
            isOverdue,
            daysOverdue,
            daysUntilDue,
            isDueToday,
            totalPendingCount: unpaid.length,
            contractOverdueCount,
            totalContractMonths: contract.durationMonths || contract.schedule.length
          });
        });
      }
    });

    return list;
  }, [contracts, todayStr, onlyCurrentDue]);

  // Overall Statistics based on all pending
  const overdueCountOverall = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.schedule.filter((i) => i.status !== 'paid' && i.dueDate < todayStr).length, 0);

  const overdueTotalAmount = contracts
    .filter((c) => c.status === 'active')
    .reduce(
      (sum, c) =>
        sum +
        c.schedule
          .filter((i) => i.status !== 'paid' && i.dueDate < todayStr)
          .reduce((s, i) => s + (i.amount - (i.paidAmount || 0)), 0),
      0
    );

  const dueTodayTotalAmount = contracts
    .filter((c) => c.status === 'active')
    .reduce(
      (sum, c) =>
        sum +
        c.schedule
          .filter((i) => i.status !== 'paid' && i.dueDate === todayStr)
          .reduce((s, i) => s + (i.amount - (i.paidAmount || 0)), 0),
      0
    );

  const dueTodayCount = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.schedule.filter((i) => i.status !== 'paid' && i.dueDate === todayStr).length, 0);

  const totalOutstandingBalance = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.remainingBalance, 0);

  // 3. Filtered list based on search and user criteria
  const filteredInstallments = useMemo(() => {
    return processedInstallments
      .filter((item) => {
        const { contract, installment } = item;

        // Search matching
        const matchesSearch =
          contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.customerPhone.includes(searchTerm.trim()) ||
          contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.itemNameOrDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contract.department && contract.department.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        // Department filter
        if (departmentFilter !== 'all') {
          if (contract.department !== departmentFilter) return false;
        }

        // Status filter
        if (statusFilter === 'overdue' && !item.isOverdue) return false;
        if (statusFilter === 'today' && !item.isDueToday) return false;
        if (statusFilter === 'upcoming' && (item.isOverdue || item.isDueToday)) return false;

        // Custom Date Range filter
        if (dateFrom && installment.dueDate < dateFrom) return false;
        if (dateTo && installment.dueDate > dateTo) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return sortOrder === 'asc'
            ? a.installment.dueDate.localeCompare(b.installment.dueDate)
            : b.installment.dueDate.localeCompare(a.installment.dueDate);
        } else if (sortBy === 'amount') {
          const reqA = a.installment.amount - (a.installment.paidAmount || 0);
          const reqB = b.installment.amount - (b.installment.paidAmount || 0);
          return sortOrder === 'asc' ? reqA - reqB : reqB - reqA;
        } else {
          return sortOrder === 'asc'
            ? a.contract.customerName.localeCompare(b.contract.customerName)
            : b.contract.customerName.localeCompare(a.contract.customerName);
        }
      });
  }, [processedInstallments, searchTerm, departmentFilter, statusFilter, dateFrom, dateTo, sortBy, sortOrder]);

  // Open Interactive Payment Modal
  const handleOpenPayModal = (contract: InstallmentContract, installment: InstallmentItem) => {
    const requiredAmount = installment.amount - (installment.paidAmount || 0);
    setPayingContract(contract);
    setPayingInstallment(installment);
    setPayingAmount(requiredAmount);
    setRolloverMode('rollover_to_balance');
    setPaymentMethod('cash');
    setPayNotes(`تسديد قسط شهر #${installment.installmentNumber} للعقد ${contract.contractNumber}`);
  };

  // Dynamic calculations for the payment modal
  const originalDueAmount = payingInstallment
    ? payingInstallment.amount - (payingInstallment.paidAmount || 0)
    : 0;

  const unpaidDifference = Math.max(0, originalDueAmount - payingAmount);
  const willRollover = unpaidDifference > 0;

  // Confirm payment submission (المصححة والمعدلة بالكامل)
  // Confirm payment submission
 const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingContract || !payingInstallment || payingAmount <= 0) return;

    setIsPaying(true);

    // Prepare note with clear rollover detail if partial payment
    let finalNotes = payNotes.trim();
    if (willRollover && rolloverMode !== 'partial_keep') {
      finalNotes = `${payNotes ? payNotes + ' | ' : ''}تسديد ${payingAmount.toLocaleString()} د.ع وترحيل متبقي ${unpaidDifference.toLocaleString()} د.ع صافي بدون فوائد`;
    }

    const res = await payInstallment(payingContract.id, payingInstallment.id, {
      paidAmount: payingAmount,
      paymentMethod,
      notes: finalNotes,
      rolloverMode
    });

    setIsPaying(false);

    if (res.success) {
      if (res.receipt) {
        setActiveReceiptForPrint(res.receipt);
      }
      
      // 1. إغلاق النافذة المنبثقة للسداد
      setPayingContract(null);
      setPayingInstallment(null);

      // 2. 🟢 إجبار الواجهة على البقاء في تبويب التسديدات وعدم العودة للـ 
      setActiveTab('payments'); 
    } else {
      alert(res.error || 'فشلت عملية تسجيل السداد');
    }
  };

  const departmentsList =
    companySettings.departments && companySettings.departments.length > 0
      ? companySettings.departments
      : [
          'قسم الأجهزة الكهربائية والمنزلية',
          'قسم الهواتف الذكية والإلكترونيات',
          'قسم المفروشات والأثاث',
          'قسم القروض والتمويل المالي',
          'قسم الدراجات والسيارات'
        ];
  const handleSetDateFilter = (type: 'today' | 'this_week' | 'this_month' | 'reset') => {
    if (type === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (type === 'this_week') {
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    } else if (type === 'this_month') {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setDateFrom(first);
      setDateTo(last);
    } else {
      setDateFrom('');
      setDateTo('');
      setDepartmentFilter('all');
      setStatusFilter('all');
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Daily Cash Box & Collections Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's Collected Cash (صندوق اليومية) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100">صندوق اليومية (المقبوضات المحصلة اليوم)</span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-xl sm:text-2xl">
            {todayCollectedAmount.toLocaleString()}{' '}
            <span className="text-xs font-sans font-medium">{companySettings.currencySymbol}</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-100 font-medium flex items-center justify-between">
            <span>عدد وصولات اليوم: {todayReceipts.length} وصل</span>
            <span>{todayStr}</span>
          </div>
        </div>

        {/* Card 2: Due Today */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">أقساط تستحق اليوم ({todayStr})</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-xl sm:text-2xl text-blue-700">
            {dueTodayTotalAmount.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-medium">{companySettings.currencySymbol}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            عدد الأقساط: {dueTodayCount} قسط مستحق اليوم
          </div>
        </div>

        {/* Card 3: Overdue Alert */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            overdueCountOverall > 0 ? 'bg-rose-50 border-rose-200 shadow-xs' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold">أقساط متأخرة عن موعدها</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-xl sm:text-2xl text-rose-700">
            {overdueTotalAmount.toLocaleString()}{' '}
            <span className="text-xs font-sans text-rose-500 font-medium">{companySettings.currencySymbol}</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-bold">
            {overdueCountOverall > 0
              ? `⚠️ يوجد (${overdueCountOverall}) قسط متأخر يستلزم التحصيل`
              : 'لا توجد أقساط متأخرة حالياً'}
          </div>
        </div>

        {/* Card 4: Total Outstanding Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">إجمالي المتبقي للتحصيل</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-xl sm:text-2xl text-slate-900">
            {totalOutstandingBalance.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-medium">{companySettings.currencySymbol}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">بذمة جميع العقود النشطة</div>
        </div>
      </div>

      {/* Main Filter & View Mode Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>لوحة تسديد الأقساط الشهرية</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              استعراض مبسط ومرن للأقساط المستحقة حالياً مع دعم التعديل اليدوي للمبلغ وترحيل المتبقي صافياً بدون فوائد
            </p>
          </div>

          {/* Requirement 1: Mode Switch (Show ONLY current due installment vs all) */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setOnlyCurrentDue(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyCurrentDue
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="عرض قسط الشهر المستحق حالياً فقط لكل عقد لتجنب تكرار الأشهر البعيدة"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>القسط المستحق حالياً فقط (مستحسن)</span>
            </button>
            <button
              onClick={() => setOnlyCurrentDue(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                !onlyCurrentDue
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="عرض كافة الأقساط المتبقية لجميع الأشهر"
            >
              <span>عرض جميع الأقساط</span>
            </button>
          </div>
        </div>

        {/* Search, Department & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Smart Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالزبون، الهاتف، العقد، السلعة..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pr-9 pl-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
            >
              <option value="all">🏢 جميع الأقسام</option>
              {departmentsList.map((dep, idx) => (
                <option key={idx} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
            >
              <option value="all">📋 كل الحالات</option>
              <option value="overdue">🚨 متأخر عن السداد (عاجل)</option>
              <option value="today">⚡ يستحق اليوم فقط</option>
              <option value="upcoming">🗓️ قادم في موعده</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
            >
              <option value="dueDate">ترتيب: تاريخ الاستحقاق</option>
              <option value="amount">ترتيب: مبلغ القسط</option>
              <option value="customerName">ترتيب: اسم العميل</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              title="تغيير اتجاه الترتيب"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>نطاق تاريخ الاستحقاق:</span>
            </span>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">من:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white text-slate-900 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">إلى:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white text-slate-900 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSetDateFilter('today')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
            >
              اليوم
            </button>
            <button
              onClick={() => handleSetDateFilter('this_month')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
            >
              هذا الشهر
            </button>
            <button
              onClick={() => handleSetDateFilter('reset')}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requirement 1: Simplified Table Displaying Strictly:
          (اسم الزبون، السلعة أو القرض، رقم القسط المستحق الحالي، المبلغ المطلوب، تاريخ الاستحقاق) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800">
              {onlyCurrentDue
                ? `جدول الأقساط المستحقة حالياً (${filteredInstallments.length} عميل/عقد)`
                : `جميع الأقساط المتبقية (${filteredInstallments.length} قسط)`}
            </span>
            {onlyCurrentDue && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                مركز على الشهر الحالي
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 font-mono font-bold">
            إجمالي المبالغ المطلوبة في الجدول:{' '}
            <span className="text-blue-700">
              {filteredInstallments
                .reduce((s, i) => s + (i.installment.amount - (i.installment.paidAmount || 0)), 0)
                .toLocaleString()}{' '}
              {companySettings.currencySymbol}
            </span>
          </div>
        </div>

        {filteredInstallments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/80" />
            <div className="font-bold text-slate-700 text-sm">لا توجد أقساط مطلوب تسديدها مطابقة للفلاتر</div>
            <p className="text-slate-400 max-w-sm mx-auto text-[11px]">
              جميع الأقساط مسددة أو لا تطابق البحث. يمكنك إلغاء الفلاتر أو التبديل لعرض جميع الأقساط.
            </p>
            <button
              onClick={() => handleSetDateFilter('reset')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
            >
              إلغاء جميع الفلاتر
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  {/* Column 1: اسم الزبون */}
                  <th className="py-3.5 px-4">اسم الزبون</th>
                  {/* Column 2: السلعة أو القرض */}
                  <th className="py-3.5 px-3">السلعة أو القرض</th>
                  {/* Column 3: رقم القسط المستحق الحالي */}
                  <th className="py-3.5 px-3">رقم القسط المستحق الحالي</th>
                  {/* Column 4: المبلغ المطلوب */}
                  <th className="py-3.5 px-3">المبلغ المطلوب</th>
                  {/* Column 5: تاريخ الاستحقاق */}
                  <th className="py-3.5 px-3">تاريخ الاستحقاق</th>
                  {/* Action Column */}
                  <th className="py-3.5 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstallments.map((row) => {
                  const {
                    contract,
                    installment,
                    isOverdue,
                    daysOverdue,
                    isDueToday,
                    daysUntilDue,
                    contractOverdueCount,
                    totalPendingCount,
                    totalContractMonths
                  } = row;

                  const requiredAmount = installment.amount - (installment.paidAmount || 0);

                  return (
                    <tr
                      key={`${contract.id}-${installment.id}`}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isOverdue
                          ? 'bg-rose-50/40 border-r-4 border-r-rose-500'
                          : isDueToday
                          ? 'bg-amber-50/40 border-r-4 border-r-amber-500'
                          : ''
                      }`}
                    >
                      {/* 1. اسم الزبون */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openCustomerProfile(contract.customerId)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-right flex items-center gap-1.5 group"
                            title="عرض كشف الحساب الكامل للزبون وجميع أجهزته"
                          >
                            <span className="group-hover:underline">{contract.customerName}</span>
                            <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{contract.customerPhone}</span>
                        </div>
                      </td>

                      {/* 2. السلعة أو القرض */}
                      <td className="py-3.5 px-3">
                        <div
                          className="font-bold text-slate-900 max-w-[220px] truncate"
                          title={contract.itemNameOrDescription}
                        >
                          {contract.itemNameOrDescription}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {contract.department && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              <Tag className="w-2.5 h-2.5 text-blue-500" />
                              <span>{contract.department}</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            عقد #{contract.contractNumber}
                          </span>
                        </div>
                      </td>

                      {/* 3. رقم القسط المستحق الحالي */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 font-bold font-mono">
                          <span>قسط شهر #{installment.installmentNumber}</span>
                          <span className="text-[10px] text-blue-500 font-normal">
                            (من أصل {totalContractMonths})
                          </span>
                        </div>

                        {/* Extra info if customer has multiple overdue installments */}
                        {contractOverdueCount > 1 && (
                          <div className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>يوجد {contractOverdueCount} أقساط متأخرة</span>
                          </div>
                        )}
                      </td>

                      {/* 4. المبلغ المطلوب */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {requiredAmount.toLocaleString()}{' '}
                          <span className="text-xs font-sans text-slate-500 font-medium">
                            {companySettings.currencySymbol}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          المتبقي من العقد: {contract.remainingBalance.toLocaleString()}
                        </div>
                      </td>

                      {/* 5. تاريخ الاستحقاق */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{installment.dueDate}</span>
                        </div>
                        <div className="mt-0.5">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>متأخر منذ {daysOverdue} يوم</span>
                            </span>
                          ) : isDueToday ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-2.5 h-2.5" />
                              <span>يستحق اليوم!</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              متبقي {daysUntilDue} يوم
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. الإجراء (زر تسديد تفاعلي) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenPayModal(contract, installment)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-all transform active:scale-95"
                          title="تسجيل سداد القسط وتعديل المبلغ وترحيل المتبقي"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>تسديد</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Requirement 2: Interactive Flexible Payment Modal (نافذة السداد المرن وتعديل المبلغ والترحيل بدون فوائد) */}
      {payingContract && payingInstallment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    تسجيل سداد قسط (نافذة السداد المرن)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    إمكانية تعديل المبلغ المدفوع وترحيل المتبقي صافياً بدون أي أرباح إضافية
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPayingContract(null);
                  setPayingInstallment(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Installment Details */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  {payingContract.customerName} ({payingContract.customerPhone})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">السلعة أو القرض:</span>
                <span className="font-bold text-slate-800">
                  {payingContract.itemNameOrDescription}{' '}
                  {payingContract.department && (
                    <span className="text-blue-600">[{payingContract.department}]</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">رقم العقد والقسط:</span>
                <span className="font-mono font-bold text-slate-900">
                  عقد #{payingContract.contractNumber} •{' '}
                  <span className="text-blue-700">قسط شهر #{payingInstallment.installmentNumber}</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-bold">مبلغ القسط الأصلي المطلوب:</span>
                <span className="font-mono font-black text-sm text-slate-900">
                  {originalDueAmount.toLocaleString()} {companySettings.currencySymbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">إجمالي المتبقي بذمة العقد:</span>
                <span className="font-mono font-bold text-slate-700">
                  {payingContract.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmPay} className="space-y-4 text-xs">
              {/* Payment Amount Input (Manual Editable) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>المبلغ المدفوع كاش الآن ({companySettings.currencySymbol}) *</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    يمكنك كتابة أي مبلغ دفعه الزبون يدوياً
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={payingAmount}
                    onChange={(e) => setPayingAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 text-slate-900 text-lg font-mono font-black rounded-2xl p-3 pr-4 pl-16 border-2 border-emerald-500/60 focus:bg-white focus:outline-none focus:border-emerald-600 shadow-2xs"
                    required
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                    {companySettings.currencySymbol}
                  </span>
                </div>

                {/* Quick Presets Buttons */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPayingAmount(originalDueAmount)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                      payingAmount === originalDueAmount
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    كامل القسط ({originalDueAmount.toLocaleString()})
                  </button>
                  {originalDueAmount > 20000 && (
                    <button
                      type="button"
                      onClick={() => setPayingAmount(Math.round(originalDueAmount * 0.75))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer"
                    >
                      75% ({Math.round(originalDueAmount * 0.75).toLocaleString()})
                    </button>
                  )}
                  {originalDueAmount > 10000 && (
                    <button
                      type="button"
                      onClick={() => setPayingAmount(Math.round(originalDueAmount * 0.5))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer"
                    >
                      نصف القسط 50% ({Math.round(originalDueAmount * 0.5).toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              {/* Requirement 2: Smart Dynamic Rollover Calculation Box */}
              {willRollover && (
                <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-blue-900 text-xs sm:text-sm">
                        ترحيل مالي تلقائي وصافي (بدون أي فوائد إضافية)
                      </h4>
                      <p className="text-[11px] text-blue-800 leading-relaxed mt-1">
                        دفع الزبون{' '}
                        <strong className="font-mono text-slate-900">{payingAmount.toLocaleString()}</strong>{' '}
                        من أصل{' '}
                        <strong className="font-mono text-slate-900">{originalDueAmount.toLocaleString()}</strong>.
                        المبلغ المتبقي للترحيل هو:{' '}
                        <span className="font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                          {unpaidDifference.toLocaleString()} {companySettings.currencySymbol}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl p-3 border border-blue-100 space-y-2 text-[11px]">
                    <div className="font-bold text-slate-700">اختر آلية ترحيل المتبقي:</div>

                    <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 hover:bg-blue-100/70 transition-colors">
                      <input
                        type="radio"
                        name="rolloverMode"
                        value="rollover_to_balance"
                        checked={rolloverMode === 'rollover_to_balance'}
                        onChange={() => setRolloverMode('rollover_to_balance')}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-blue-950 text-xs block">
                          ترحيل الـ ({unpaidDifference.toLocaleString()} {companySettings.currencySymbol}) إلى الرصيد المتبقي العام فقط (موصى به)
                        </span>
                        <span className="text-[11px] text-blue-900 leading-relaxed block mt-0.5">
                          يُعتبر قسط هذا الشهر مسدداً ومنتهياً، ويبقى قسط الشهر القادم بمبلغه الأصلي كاملاً (دون تعديل أو تخفيض)، بينما يظل المتبقي ضمن إجمالي ذمة العقد فقط صافياً بدون فوائد.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                      <input
                        type="radio"
                        name="rolloverMode"
                        value="rollover_to_next"
                        checked={rolloverMode === 'rollover_to_next'}
                        onChange={() => setRolloverMode('rollover_to_next')}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          دمج وإضافة الـ ({unpaidDifference.toLocaleString()} {companySettings.currencySymbol}) على قسط الشهر القادم
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          يُسدد قسط هذا الشهر، وتتم زيادة قيمة قسط الشهر القادم ليطالب الزبون بدفع القسطين معاً.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                      <input
                        type="radio"
                        name="rolloverMode"
                        value="partial_keep"
                        checked={rolloverMode === 'partial_keep'}
                        onChange={() => setRolloverMode('partial_keep')}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          تسديد جزئي مؤقت (إبقاء نفس القسط الحالي معلقاً بمتبقي {unpaidDifference.toLocaleString()} {companySettings.currencySymbol})
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          يبقى قسط الشهر الحالي غير مكتمل حتى يأتي الزبون بباقي المبلغ خلال نفس الشهر.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 font-bold"
                  >
                    <option value="cash">نقداً (كاش بالصندوق)</option>
                    <option value="zain_cash">محفظة زين كاش (ZainCash)</option>
                    <option value="qi_card">بطاقة الماستر / كي كارد</option>
                    <option value="bank_transfer">حوالة مصرفية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ملاحظات على الوصل</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="ملاحظات أو رقم الحوالة..."
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
             {/* Action Buttons */}
<div className="flex items-center gap-2 pt-3 border-t">
<button
  type="button"
  onClick={handleConfirmPay} // 🟢 أضف هذا السطر هنا!
  disabled={isPaying || payingAmount <= 0}
  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
>
  <Check className="w-4 h-4" />
  <span>
    {isPaying
      ? 'جارِ تسجيل السداد والترحيل...'
      : `تأكيد قبض (${payingAmount.toLocaleString()} ${companySettings.currencySymbol}) وإصدار الوصل`}
  </span>
</button>

<button
  type="button"
  onClick={() => {
    setPayingContract(null);
    setPayingInstallment(null);
  }}
  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all"
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
