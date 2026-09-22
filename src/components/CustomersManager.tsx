import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  FileText,
  Shield,
  Trash2,
  Edit2,
  Banknote,
  PlusCircle,
  Eye,
  AlertTriangle,
  CreditCard,
  X,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';

export const CustomersManager: React.FC = () => {
  const {
    customers,
    contracts,
    companySettings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    currentUser,
    openNewContractModal,
    globalSearch,
    setGlobalSearch,
    deleteAllCustomers,
    openCustomerProfile
  } = useApp();

  const [localSearch, setLocalSearch] = useState<string>('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Customer Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [idNumber, setIdNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [guarantorName, setGuarantorName] = useState<string>('');
  const [guarantorPhone, setGuarantorPhone] = useState<string>('');
  const [guarantorJob, setGuarantorJob] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Customer Profile View
  const [selectedProfileCustomer, setSelectedProfileCustomer] = useState<Customer | null>(null);

  // Danger Zone: Delete All Customers Modal
  const [isDangerModalOpen, setIsDangerModalOpen] = useState<boolean>(false);
  const [dangerPassword, setDangerPassword] = useState<string>('');
  const [dangerError, setDangerError] = useState<string>('');
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);

  const effectiveSearch = (globalSearch || localSearch).trim().toLowerCase();

  const filteredCustomers = customers.filter((c) => {
    if (!effectiveSearch) return true;
    return (
      c.name.toLowerCase().includes(effectiveSearch) ||
      c.phone.includes(effectiveSearch) ||
      c.idNumber.toLowerCase().includes(effectiveSearch) ||
      (c.guarantorName && c.guarantorName.toLowerCase().includes(effectiveSearch))
    );
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setIdNumber('');
    setAddress('');
    setGuarantorName('');
    setGuarantorPhone('');
    setGuarantorJob('');
    setNotes('');
    setIsCustomerModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setIdNumber(c.idNumber);
    setAddress(c.address);
    setGuarantorName(c.guarantorName || '');
    setGuarantorPhone(c.guarantorPhone || '');
    setGuarantorJob(c.guarantorJob || '');
    setNotes(c.notes || '');
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('الاسم ورقم الهاتف مطلوبان');
      return;
    }

    if (editingCustomer) {
      const ok = await updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        idNumber: idNumber.trim(),
        address: address.trim(),
        guarantorName: guarantorName.trim(),
        guarantorPhone: guarantorPhone.trim(),
        guarantorJob: guarantorJob.trim(),
        notes: notes.trim()
      });
      if (ok) setIsCustomerModalOpen(false);
    } else {
      const created = await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        idNumber: idNumber.trim(),
        address: address.trim(),
        guarantorName: guarantorName.trim(),
        guarantorPhone: guarantorPhone.trim(),
        guarantorJob: guarantorJob.trim(),
        notes: notes.trim()
      });
      if (created) setIsCustomerModalOpen(false);
    }
  };

  const handleDeleteCustomer = async (c: Customer) => {
    if (confirm(`هل أنت متأكد من حذف العميل "${c.name}"؟`)) {
      const res = await deleteCustomer(c.id);
      if (!res.success) {
        alert(res.error || 'تعذر حذف العميل');
      }
    }
  };

  const handleConfirmDeleteAll = async () => {
    if (!dangerPassword) {
      setDangerError('يرجى إدخال كلمة سر المدير للتأكيد');
      return;
    }
    setDangerError('');
    setIsDeletingAll(true);
    const res = await deleteAllCustomers(dangerPassword);
    setIsDeletingAll(false);

    if (res.success) {
      alert(res.message || 'تم حذف كافة بيانات العملاء بنجاح');
      setIsDangerModalOpen(false);
      setDangerPassword('');
    } else {
      setDangerError(res.error || 'كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>سجل العملاء والكفلاء (Customer & Guarantor Directory)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات الزبائن، أرقام الهويات، عناوين السكن، والكفلاء الضامنين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>

          {currentUser?.role === 'manager' && (
            <button
              onClick={() => {
                setDangerPassword('');
                setDangerError('');
                setIsDangerModalOpen(true);
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="حذف جميع بيانات العملاء (تهيئة النظام)"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>حذف جميع العملاء</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch || globalSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setGlobalSearch(e.target.value);
            }}
            placeholder="بحث فوري سريع بالاسم أو رقم الهاتف أو الهوية أو اسم الكفيل..."
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pr-10 pl-4 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        <div className="text-xs text-slate-500 font-bold">
          العدد الإجمالي: {filteredCustomers.length} عميل
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">لا يوجد عملاء يطابقون البحث</h3>
            <p className="text-xs text-slate-400">
              يمكنك إضافة عميل جديد بالضغط على زر "إضافة عميل جديد" في الأعلى.
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const customerContracts = contracts.filter((c) => c.customerId === cust.id);
            const activeContracts = customerContracts.filter((c) => c.status === 'active');
            const totalRemaining = customerContracts.reduce((sum, c) => sum + c.remainingBalance, 0);

            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => openCustomerProfile(cust.id)}
                        className="font-black text-slate-900 text-sm hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                        title="انقر لفتح سجل العميل الشامل"
                      >
                        <span>{cust.name}</span>
                      </h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <a href={`tel:${cust.phone}`} className="hover:text-blue-600 hover:underline">
                          {cust.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCustomerProfile(cust.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="عرض كشف الحساب والأجهزة والأقساط"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="تعديل بيانات العميل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {currentUser?.role === 'manager' && (
                        <button
                          onClick={() => handleDeleteCustomer(cust)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">رقم الهوية:</span>
                      <span className="font-mono font-medium">{cust.idNumber || 'غير محدد'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">العنوان:</span>
                      <span className="truncate max-w-[180px] font-medium">{cust.address || 'غير محدد'}</span>
                    </div>

                    {cust.guarantorName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الكفيل:</span>
                        <span className="font-medium text-slate-800">
                          {cust.guarantorName} ({cust.guarantorPhone || 'لا هاتف'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Status Summary Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">العقود النشطة</div>
                    <div className="font-black text-slate-800 font-mono mt-0.5">
                      {activeContracts.length} عقد
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 font-bold">إجمالي المتبقي بذمته</div>
                    <div className="font-black text-rose-600 font-mono mt-0.5">
                      {totalRemaining.toLocaleString()} {companySettings.currencySymbol}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openNewContractModal('installment', cust.id)}
                    className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>تقسيط جديد</span>
                  </button>

                  <button
                    onClick={() => openNewContractModal('cash_loan', cust.id)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>قرض نقدي</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add or Edit Customer */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>{editingCustomer ? 'تعديل بيانات العميل' : 'إضافة ملف عميل جديد'}</span>
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكامل للعميل *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد عبد الرحمن حسن"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07701234567"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهوية / البطاقة الوطنية
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="199012348572"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان السكن بالتفصيل
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: بغداد - الكرخ - حي الجامعة محلة 620"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Guarantor Details Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>بيانات الكفيل الضامن (الضمانة)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      اسم الكفيل الثلاثي
                    </label>
                    <input
                      type="text"
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                      placeholder="مثال: حسام عبد الرحمن حسن"
                      className="w-full bg-white text-slate-900 text-xs rounded-xl p-2 border border-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      رقم هاتف الكفيل
                    </label>
                    <input
                      type="text"
                      value={guarantorPhone}
                      onChange={(e) => setGuarantorPhone(e.target.value)}
                      placeholder="07809876543"
                      className="w-full bg-white text-slate-900 text-xs rounded-xl p-2 border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      وظيفة وجهة عمل الكفيل
                    </label>
                    <input
                      type="text"
                      value={guarantorJob}
                      onChange={(e) => setGuarantorJob(e.target.value)}
                      placeholder="مثال: موظف حكومي في وزارة الصحة"
                      className="w-full bg-white text-slate-900 text-xs rounded-xl p-2 border border-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="ملاحظات حول الالتزام بالسداد أو شيكات الضمان..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-blue-500/20"
                >
                  {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customer Profile Drawer */}
      {selectedProfileCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedProfileCustomer.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  هاتف: {selectedProfileCustomer.phone} • الهوية: {selectedProfileCustomer.idNumber || 'غير محدد'}
                </p>
              </div>
              <button
                onClick={() => setSelectedProfileCustomer(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Guarantor Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>معلومات الكفيل الضامن</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">الاسم:</span>{' '}
                    <strong className="text-slate-800">{selectedProfileCustomer.guarantorName || 'لا يوجد'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">الهاتف:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedProfileCustomer.guarantorPhone || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">الوظيفة:</span>{' '}
                    <strong className="text-slate-800">{selectedProfileCustomer.guarantorJob || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Customer Contracts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">
                    العقود والقروض المرتبطة بهذا العميل
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const id = selectedProfileCustomer.id;
                        setSelectedProfileCustomer(null);
                        openNewContractModal('installment', id);
                      }}
                      className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      + عقد تقسيط
                    </button>
                    <button
                      onClick={() => {
                        const id = selectedProfileCustomer.id;
                        setSelectedProfileCustomer(null);
                        openNewContractModal('cash_loan', id);
                      }}
                      className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
                    >
                      + قرض نقدي
                    </button>
                  </div>
                </div>

                {contracts.filter((c) => c.customerId === selectedProfileCustomer.id).length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs text-center">
                    لا توجد عقود مسجلة لهذا العميل حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contracts
                      .filter((c) => c.customerId === selectedProfileCustomer.id)
                      .map((cnt) => (
                        <div
                          key={cnt.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-900 font-mono">
                              {cnt.contractNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                cnt.status === 'completed'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {cnt.status === 'completed' ? 'مسدد بالكامل' : 'عقد نشط'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 font-medium">
                            {cnt.itemNameOrDescription}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-100">
                            <div>
                              <div className="text-[10px] text-slate-400">الإجمالي</div>
                              <div className="font-bold text-slate-900 font-mono">
                                {cnt.totalWithProfit.toLocaleString()} {companySettings.currencySymbol}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">المسدد</div>
                              <div className="font-bold text-emerald-600 font-mono">
                                {cnt.totalPaid.toLocaleString()} {companySettings.currencySymbol}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">المتبقي</div>
                              <div className="font-bold text-rose-600 font-mono">
                                {cnt.remainingBalance.toLocaleString()} {companySettings.currencySymbol}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProfileCustomer(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete All Customers Danger Zone */}
      {isDangerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-rose-900">
                تحذير أمني حرج: مسح بيانات العملاء!
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold">
                أنت على وشك حذف كافة سجلات العملاء والعقود والإيصالات من هذا النظام بشكل دائم.
              </p>
            </div>

            {dangerError && (
              <div className="p-3 rounded-lg bg-rose-100 text-rose-900 font-bold text-xs border border-rose-300">
                {dangerError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                أدخل كلمة سر المدير لتأكيد مسح البيانات:
              </label>
              <input
                type="password"
                value={dangerPassword}
                onChange={(e) => setDangerPassword(e.target.value)}
                placeholder="كلمة مرور المشرف..."
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl p-2.5 border border-slate-300 focus:bg-white focus:outline-none focus:border-rose-600"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDangerModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={handleConfirmDeleteAll}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isDeletingAll ? 'جاري التحقق...' : 'تأكيد الحذف الشامل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
