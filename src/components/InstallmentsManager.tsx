import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  Printer,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Phone,
  ArrowRight,
  TrendingUp,
  Percent,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstallmentContract, ContractType } from '../types';

export const InstallmentsManager: React.FC = () => {
  const {
    contracts,
    customers,
    companySettings,
    createContract,
    payInstallment,
    setActiveReceiptForPrint,
    isNewContractModalOpen,
    setIsNewContractModalOpen,
    newContractInitialType,
    openNewContractModal,
    selectedCustomerIdForContract,
    setSelectedCustomerIdForContract,
    openCustomerProfile
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Expanded contract for detail view
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  // New Contract Form State
  const [contractType, setContractType] = useState<ContractType>(newContractInitialType || 'installment');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [originalAmount, setOriginalAmount] = useState<number>(1000000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [profitRate, setProfitRate] = useState<number>(0); // 0% default as requested
  const [manualProfitAmount, setManualProfitAmount] = useState<number>(0);
  const [isManualProfit, setIsManualProfit] = useState<boolean>(false);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [contractNotes, setContractNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Payment Modal State
  const [payingContract, setPayingContract] = useState<InstallmentContract | null>(null);
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(null);
  const [payingAmount, setPayingAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);

  // Default department if none selected
  const departmentsList = companySettings.departments && companySettings.departments.length > 0
    ? companySettings.departments
    : [
        'قسم الأجهزة الكهربائية والمنزلية',
        'قسم الهواتف الذكية والإلكترونيات',
        'قسم المفروشات والأثاث',
        'قسم القروض والتمويل المالي',
        'قسم الدراجات والسيارات'
      ];

  // Sync initial type and customer from context
  useEffect(() => {
    if (newContractInitialType) {
      setContractType(newContractInitialType);
      if (newContractInitialType === 'cash_loan') {
        setDepartment('قسم القروض والتمويل المالي');
      } else if (!department && departmentsList.length > 0) {
        setDepartment(departmentsList[0]);
      }
    }
  }, [newContractInitialType, departmentsList, department]);

  // تحديث: عدم تحديد أي زبون تلقائياً بفرضه من القائمة، وترك الحقل فارغاً للبحث
  useEffect(() => {
    if (selectedCustomerIdForContract) {
      setSelectedCustomerId(selectedCustomerIdForContract);
    } else {
      setSelectedCustomerId('');
      setCustomerSearchQuery('');
    }
  }, [selectedCustomerIdForContract, isNewContractModalOpen]);

  // Selected customer object
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Smart Autocomplete Customers List
  const matchingCustomers = customers.filter((c) => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.idNumber && c.idNumber.includes(q)) ||
      (c.guarantorName && c.guarantorName.toLowerCase().includes(q))
    );
  });

  // Financial calculations
  const netFinanced = Math.max(0, originalAmount - downPayment);
  const calculatedProfit = isManualProfit
    ? manualProfitAmount
    : Math.round(netFinanced * (profitRate / 100));
  const totalWithProfit = originalAmount + calculatedProfit;
  const remainingFinanced = Math.max(0, totalWithProfit - downPayment);
  const monthlyInstallment = durationMonths > 0 ? Math.round(remainingFinanced / durationMonths) : 0;

  // Search and filter contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerPhone.includes(searchTerm) ||
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.itemNameOrDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || c.department === departmentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDept;
  });

  // Handle Contract Submission
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('يرجى اختيار العميل أولاً عبر البحث الذكي');
      return;
    }

    setIsSubmitting(true);
    const chosenDept = department || (contractType === 'cash_loan' ? 'قسم القروض والتمويل المالي' : departmentsList[0]);

    const created = await createContract({
      type: contractType,
      customerId: selectedCustomerId,
      itemNameOrDescription: itemName || (contractType === 'cash_loan' ? 'تمويل وقرض نقدي' : 'تقسيط سلع وأجهزة'),
      department: chosenDept,
      originalAmount,
      downPayment,
      profitRatePercent: isManualProfit ? 0 : profitRate,
      manualProfitAmount: calculatedProfit,
      totalWithProfit,
      durationMonths,
      monthlyInstallment,
      startDate,
      notes: contractNotes
    });
    setIsSubmitting(false);

    if (created) {
      setIsNewContractModalOpen(false);
      setSelectedCustomerIdForContract(null);
      // Reset form
      setItemName('');
      setOriginalAmount(1000000);
      setDownPayment(100000);
      setProfitRate(0);
      setDurationMonths(12);
      setExpandedContractId(created.id);
    } else {
      alert('تعذر إنشاء العقد، يرجى مراجعة البيانات المدخلة');
    }
  };

  // Open Payment modal for specific installment
  const handleOpenPay = (contract: InstallmentContract, installmentId: string) => {
    const inst = contract.schedule.find((i) => i.id === installmentId);
    if (!inst) return;

    setPayingContract(contract);
    setPayingInstallmentId(installmentId);
    setPayingAmount(inst.amount - (inst.paidAmount || 0));
    setPaymentMethod('cash');
    setPayNotes(`سداد القسط رقم ${inst.installmentNumber}`);
  };

  // Submit payment
  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingContract || !payingInstallmentId) return;

    setIsPaying(true);
    const result = await payInstallment(payingContract.id, payingInstallmentId, {
      paidAmount: payingAmount,
      paymentMethod,
      notes: payNotes
    });
    setIsPaying(false);

    if (result.success && result.receipt) {
      // إغلاق نافذة السداد والبقاء في نفس المكان
      setPayingContract(null);
      setPayingInstallmentId(null);
      
      // تم إلغاء السطر التلقائي المسبب للانتقال
      // setActiveReceiptForPrint(result.receipt);
    } else {
      alert(result.error || 'فشلت عملية السداد');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Fast Buttons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>إدارة عقود التقسيط والقروض النقدية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدولة الاستحقاقات الشهرية، تحصيل الأقساط، وحساب الأرباح ورأس المال
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openNewContractModal('installment')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>عقد تقسيط سلع/خدمات</span>
          </button>

          <button
            onClick={() => openNewContractModal('cash_loan')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Banknote className="w-4 h-4" />
            <span>عقد قرض نقدي مالي</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم العقد، اسم العميل، رقم الهاتف، أو وصف السلعة..."
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pr-10 pl-4 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="all">كافة أنواع العقود</option>
            <option value="installment">عقود تقسيط الأجهزة والسلع</option>
            <option value="cash_loan">عقود القروض النقدية</option>
          </select>
        </div>

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
        >
          <option value="all">جميع الأقسام</option>
          {departmentsList.map((dep, idx) => (
            <option key={idx} value={dep}>
              {dep}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
        >
          <option value="all">كافة الحالات</option>
          <option value="active">عقود جارية ونشطة</option>
          <option value="completed">عقود مكتملة ومسددة بالكامل</option>
        </select>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">لا توجد عقود مسجلة تطابق البحث</h3>
            <p className="text-xs text-slate-400">
              يمكنك إنشاء عقد تقسيط جديد أو قرض نقدي من الأزرار العلوية.
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const isExpanded = expandedContractId === contract.id;
            const progressPercent =
              contract.totalWithProfit > 0
                ? Math.min(100, Math.round((contract.totalPaid / contract.totalWithProfit) * 100))
                : 100;

            const paidCount = contract.schedule.filter((i) => i.status === 'paid').length;
            const remainingCount = contract.schedule.length - paidCount;

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Contract Summary Bar */}
                <div
                  onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs ${
                        contract.type === 'cash_loan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {contract.type === 'cash_loan' ? (
                        <Banknote className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {contract.contractNumber}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            contract.type === 'cash_loan'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {contract.type === 'cash_loan' ? 'قرض نقدي' : 'تقسيط سلع'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            contract.status === 'completed'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {contract.status === 'completed' ? 'مسدد بالكامل' : 'عقد نشط'}
                        </span>

                        {contract.department && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                            {contract.department}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 font-bold mt-1 flex items-center gap-2 flex-wrap">
                        <span>العميل: {contract.customerName} • {contract.customerPhone}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCustomerProfile(contract.customerId);
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer"
                          title="عرض سجل العميل وجميع أجهزته السابقة"
                        >
                          (سجل الأجهزة والقروض)
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {contract.itemNameOrDescription} • تاريخ البدء: {contract.startDate}
                      </div>
                    </div>
                  </div>

                  {/* Financial Overview Metrics */}
                  <div className="flex items-center gap-6 sm:gap-8 mr-auto">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-medium">الإجمالي الكلي</div>
                      <div className="text-sm font-black text-slate-900 font-mono">
                        {contract.totalWithProfit.toLocaleString()} {companySettings.currencySymbol}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-medium">المتبقي للتحصيل</div>
                      <div className="text-sm font-black text-rose-600 font-mono">
                        {contract.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] text-slate-400 font-medium">القسط الشهري</div>
                      <div className="text-sm font-black text-blue-700 font-mono">
                        {contract.monthlyInstallment.toLocaleString()} {companySettings.currencySymbol}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      contract.status === 'completed' ? 'bg-slate-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Expanded Details: Financial Cards & Schedule Table */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/50 border-t border-slate-200 space-y-6 animate-in fade-in duration-150">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold">أصل التمويل (رأس المال)</div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 font-mono mt-1">
                          {contract.originalAmount.toLocaleString()} {companySettings.currencySymbol}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold">الدفعة الأولى (المقدمة)</div>
                        <div className="text-xs sm:text-sm font-black text-indigo-700 font-mono mt-1">
                          {contract.downPayment.toLocaleString()} {companySettings.currencySymbol}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold">الربح المضاف (الفائدة)</div>
                        <div className="text-xs sm:text-sm font-black text-emerald-700 font-mono mt-1">
                          {contract.manualProfitAmount.toLocaleString()} {companySettings.currencySymbol}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold">المسدد فعلياً</div>
                        <div className="text-xs sm:text-sm font-black text-emerald-600 font-mono mt-1">
                          {contract.totalPaid.toLocaleString()} {companySettings.currencySymbol}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold">المتبقي بذمة العميل</div>
                        <div className="text-xs sm:text-sm font-black text-rose-600 font-mono mt-1">
                          {contract.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold">نسبة الإنجاز</div>
                        <div className="text-xs sm:text-sm font-black text-blue-600 font-mono mt-1">
                          {progressPercent}% ({paidCount}/{contract.schedule.length} قسط)
                        </div>
                      </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>جدول ومواعيد تسديد الأقساط الشهرية</span>
                        </h4>
                        <span className="text-[11px] text-slate-500 font-bold">
                          المتبقي: {remainingCount} قسط شهري
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">رقم القسط</th>
                              <th className="py-2.5 px-3">تاريخ الاستحقاق</th>
                              <th className="py-2.5 px-3">مبلغ القسط</th>
                              <th className="py-2.5 px-3">المسدد</th>
                              <th className="py-2.5 px-3">حالة السداد</th>
                              <th className="py-2.5 px-3">تاريخ السداد والوصل</th>
                              <th className="py-2.5 px-3 text-center">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {contract.schedule.map((inst) => {
                              const isPaid = inst.status === 'paid';
                              return (
                                <tr
                                  key={inst.id}
                                  className={`hover:bg-slate-50/70 transition-colors ${
                                    isPaid ? 'bg-emerald-50/20' : ''
                                  }`}
                                >
                                  <td className="py-2.5 px-3 font-bold font-mono text-slate-700">
                                    قسط #{inst.installmentNumber}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-600">
                                    {inst.dueDate}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                    {inst.amount.toLocaleString()} {companySettings.currencySymbol}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">
                                    {inst.paidAmount > 0
                                      ? `${inst.paidAmount.toLocaleString()} ${companySettings.currencySymbol}`
                                      : '-'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {isPaid ? (
                                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                        تم التسديد
                                      </span>
                                    ) : (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                        بانتظار السداد
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                                    {inst.paidDate ? (
                                      <div>
                                        <div>{inst.paidDate}</div>
                                        <div className="text-[10px] text-blue-600 font-bold">
                                          {inst.receiptNumber}
                                        </div>
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {!isPaid ? (
                                      <button
                                        onClick={() => handleOpenPay(contract, inst.id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-2xs"
                                      >
                                        تسديد القسط
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          const fakeReceipt = {
                                            id: `rec-${inst.id}`,
                                            receiptNumber: inst.receiptNumber || 'REC-REPRINT',
                                            contractId: contract.id,
                                            contractNumber: contract.contractNumber,
                                            installmentNumber: inst.installmentNumber,
                                            customerId: contract.customerId,
                                            customerName: contract.customerName,
                                            amount: inst.paidAmount,
                                            paymentDate: inst.paidDate || new Date().toISOString().split('T')[0],
                                            paymentMethod: 'cash' as const,
                                            collectedBy: inst.collectedBy || 'أمين الصندوق',
                                            collectorRole: 'موظف مبيعات ومحاسبة',
                                            remainingContractBalance: contract.remainingBalance,
                                            notes: inst.notes || `سداد القسط رقم ${inst.installmentNumber}`
                                          };
                                          setActiveReceiptForPrint(fakeReceipt);
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer text-[11px] inline-flex items-center gap-1"
                                        title="إعادة طباعة وصل السداد"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>طباعة الوصل</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create New Contract or Cash Loan */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {contractType === 'cash_loan' ? 'إنشاء عقد قرض نقدي وتمويل مالي' : 'إنشاء عقد تقسيط سلع وخدمات'}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  حساب الأرباح وجدولة الأقساط الشهرية تلقائياً
                </p>
              </div>

              <button
                onClick={() => setIsNewContractModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Selector Tabs */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setContractType('installment')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  contractType === 'installment'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>تقسيط أجهزة / سلع / خدمات</span>
              </button>

              <button
                type="button"
                onClick={() => setContractType('cash_loan')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  contractType === 'cash_loan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>قرض نقدي وتمويل مالي مباشر</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateContract} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Customer Selection: Smart Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العميل المستفيد (بحث ذكي وتفاعلي بالاسم أو الهاتف) *
                </label>

                {selectedCustomer ? (
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-xs sm:text-sm">
                          {selectedCustomer.name}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2 mt-0.5 flex-wrap">
                          <span>هاتف: {selectedCustomer.phone}</span>
                          <span>•</span>
                          <span>هوية: {selectedCustomer.idNumber || 'غير مسجلة'}</span>
                          <span>•</span>
                          <span>كفيل: {selectedCustomer.guarantorName || 'لا يوجد'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openCustomerProfile(selectedCustomer.id)}
                        className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                        title="فتح السجل الكامل لأجهزة وقروض الزبون"
                      >
                        عرض سجل الزبون
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId('');
                          setCustomerSearchQuery('');
                          setIsCustomerSearchOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        تغيير الزبون
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setIsCustomerSearchOpen(true);
                        }}
                        onFocus={() => setIsCustomerSearchOpen(true)}
                        placeholder="اكتب اسم الزبون أو رقمه أو هويته للبحث الفوري..."
                        className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pr-9 pl-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
                        autoFocus
                      />
                    </div>

                    {isCustomerSearchOpen && (
                      <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-60 overflow-y-auto">
                        {matchingCustomers.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            لا يوجد زبون مسجل يطابق هذا البحث
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {matchingCustomers.map((cust) => (
                              <div
                                key={cust.id}
                                onClick={() => {
                                  setSelectedCustomerId(cust.id);
                                  setCustomerSearchQuery('');
                                  setIsCustomerSearchOpen(false);
                                }}
                                className="p-3 hover:bg-blue-50/80 cursor-pointer transition-colors text-xs flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-bold text-slate-900">{cust.name}</div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    هاتف: {cust.phone} | هوية: {cust.idNumber || '-'} | كفيل: {cust.guarantorName || 'لا يوجد'}
                                  </div>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  اختيار
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Item / Loan Description & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {contractType === 'cash_loan' ? 'الغرض من القرض أو التمويل' : 'وصف البضاعة / الجهاز أو الخدمة المباعة بالتقسيط'} *
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={
                      contractType === 'cash_loan'
                        ? 'مثال: تمويل شخصي لمشروع صغير / تجهيز عيادة'
                        : 'مثال: مكيف سبليت 2 طن إنفيرتر T3 / هاتف آيفون 16 برو ماكس'
                    }
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القسم التابع له العقد / القرض *
                  </label>
                  <select
                    value={department || (contractType === 'cash_loan' ? 'قسم القروض والتمويل المالي' : departmentsList[0])}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                    required
                  >
                    {departmentsList.map((dep, idx) => (
                      <option key={idx} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Original Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {contractType === 'cash_loan' ? 'أصل القرض الممنوح نقداً' : 'سعر السلعة نقداً (رأس المال)'} *
                  </label>
                  <input
                    type="number"
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono font-bold"
                    required
                  />
                </div>

                {/* Down Payment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الدفعة الأولى (المقدمة المستلمة)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono font-bold"
                  />
                </div>

                {/* Profit calculation toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isManualProfit ? 'مبلغ الربح المضاف' : 'نسبة الفائدة / الربح (%)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsManualProfit(!isManualProfit)}
                      className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      {isManualProfit ? 'حساب بالنسبة %' : 'مبلغ ربح يدوي'}
                    </button>
                  </div>
                  {isManualProfit ? (
                    <input
                      type="number"
                      value={manualProfitAmount}
                      onChange={(e) => setManualProfitAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono font-bold text-emerald-700"
                    />
                  ) : (
                    <div className="relative">
                      <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={profitRate}
                        onChange={(e) => setProfitRate(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono font-bold text-emerald-700"
                      />
                    </div>
                  )}
                </div>

                {/* Duration Months */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مدة السداد بالأشهر (الأقساط) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 pr-3 pl-12 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-bold font-mono"
                      placeholder="اكتب عدد الأشهر (مثلاً 2، 5، 7، 12...)"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      شهر
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {[3, 6, 10, 12, 18, 24, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMonths(m)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          durationMonths === m
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200/70 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        {m}ش
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ توقيع العقد
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Live Financial Calculation Box */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>المحرك المالي وتفاصيل الحسبة للعقد:</span>
                  <span className="text-emerald-400 font-mono">
                    ربح مضاف: +{calculatedProfit.toLocaleString()} {companySettings.currencySymbol}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">الإجمالي مع الفائدة</div>
                    <div className="text-sm font-black text-white font-mono mt-0.5">
                      {totalWithProfit.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">المقدمة المسددة</div>
                    <div className="text-sm font-black text-indigo-400 font-mono mt-0.5">
                      {downPayment.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">المتبقي للتقسيط</div>
                    <div className="text-sm font-black text-rose-400 font-mono mt-0.5">
                      {remainingFinanced.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-blue-600/30 border border-blue-500/40 p-2.5 rounded-lg">
                    <div className="text-[10px] text-blue-200 font-bold">القسط الشهري</div>
                    <div className="text-sm font-black text-blue-300 font-mono mt-0.5">
                      {monthlyInstallment.toLocaleString()} {companySettings.currencySymbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو شروط خاصة بالعقد
                </label>
                <input
                  type="text"
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  placeholder="مثال: تسليم شيك كضمان / استقطاع من الراتب"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewContractModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري حفظ العقد والجدولة...' : 'حفظ واعتماد العقد والجدول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Installment */}
      {payingContract && payingInstallmentId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900">
                تسديد قسط شهري
              </h4>
              <button
                onClick={() => {
                  setPayingContract(null);
                  setPayingInstallmentId(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div>
                <strong>العميل:</strong> {payingContract.customerName}
              </div>
              <div>
                <strong>رقم العقد:</strong> {payingContract.contractNumber}
              </div>
              <div>
                <strong>المبلغ المتبقي بالعقد:</strong> {payingContract.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
              </div>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المبلغ المسدد الآن *
                </label>
                <input
                  type="number"
                  value={payingAmount}
                  onChange={(e) => setPayingAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  طريقة السداد
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="cash">نقداً (كاش في الصندوق)</option>
                  <option value="card">بطاقة دفع إلكتروني (كي كارد / فيزا)</option>
                  <option value="bank_transfer">حوالة مصرفية أو زين كاش</option>
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
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayingContract(null);
                    setPayingInstallmentId(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isPaying ? 'جاري السداد وتوليد الوصل...' : 'تأكيد السداد واستخرج الوصل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};