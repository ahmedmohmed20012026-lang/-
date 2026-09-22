import React, { useState } from 'react';
import {
  Building,
  Save,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  Lock,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Users,
  HardDrive
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const SettingsManager: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    usersList,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    downloadBackup,
    restoreBackup,
    deleteAllCustomers
  } = useApp();

  // Company Settings Form
  const [companyName, setCompanyName] = useState<string>(companySettings.companyName || '');
  const [phone, setPhone] = useState<string>(companySettings.phone || '');
  const [altPhone, setAltPhone] = useState<string>(companySettings.altPhone || '');
  const [address, setAddress] = useState<string>(companySettings.address || '');
  const [commercialRegister, setCommercialRegister] = useState<string>(companySettings.commercialRegister || '');
  const [currency, setCurrency] = useState<string>(companySettings.currency || 'دينار عراقي');
  const [currencySymbol, setCurrencySymbol] = useState<string>(companySettings.currencySymbol || 'د.ع');
  const [receiptFooterNote, setReceiptFooterNote] = useState<string>(companySettings.receiptFooterNote || '');
  const [termsConditions, setTermsConditions] = useState<string>(companySettings.termsConditions || '');

  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState<boolean>(false);

  // User Management Form
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('sales');
  const [userError, setUserError] = useState<string>('');

  // Danger Zone: Delete All Customers Modal
  const [isDangerModalOpen, setIsDangerModalOpen] = useState<boolean>(false);
  const [dangerPassword, setDangerPassword] = useState<string>('');
  const [dangerError, setDangerError] = useState<string>('');
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);

  // Restore Modal
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);
  const [restoreContent, setRestoreContent] = useState<string>('');
  const [restorePassword, setRestorePassword] = useState<string>('');
  const [restoreError, setRestoreError] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Handle saving company settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const success = await updateCompanySettings({
      companyName,
      phone,
      altPhone,
      address,
      commercialRegister,
      currency,
      currencySymbol,
      receiptFooterNote,
      termsConditions
    });
    setIsSavingSettings(false);
    if (success) {
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3500);
    }
  };

  // Handle Add/Edit User
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setNewRole('sales');
    setUserError('');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: any) => {
    setEditingUserId(user.id);
    setNewUsername(user.username);
    setNewPassword(''); // leave blank if keeping same
    setNewName(user.name);
    setNewRole(user.role);
    setUserError('');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    if (editingUserId) {
      const res = await updateUser(editingUserId, {
        name: newName,
        role: newRole,
        password: newPassword ? newPassword : undefined
      });
      if (res.success) {
        setIsUserModalOpen(false);
      } else {
        setUserError(res.error || 'تعذر تعديل بيانات المستخدم');
      }
    } else {
      if (!newUsername || !newPassword || !newName) {
        setUserError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      const res = await addUser({
        username: newUsername,
        password: newPassword,
        name: newName,
        role: newRole
      });
      if (res.success) {
        setIsUserModalOpen(false);
      } else {
        setUserError(res.error || 'تعذر إضافة المستخدم');
      }
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟`)) {
      const res = await deleteUser(id);
      if (!res.success) {
        alert(res.error || 'فشل حذف المستخدم');
      }
    }
  };

  // Danger Zone confirm delete all customers
  const handleConfirmDeleteAll = async () => {
    if (!dangerPassword) {
      setDangerError('يرجى كتابة كلمة مرور المدير لتأكيد هذا الإجراء الخطير');
      return;
    }

    setDangerError('');
    setIsDeletingAll(true);
    const result = await deleteAllCustomers(dangerPassword);
    setIsDeletingAll(false);

    if (result.success) {
      alert(result.message || 'تم حذف جميع بيانات العملاء والعقود والإيصالات بنجاح');
      setIsDangerModalOpen(false);
      setDangerPassword('');
    } else {
      setDangerError(result.error || 'كلمة المرور غير صحيحة');
    }
  };

  // Restore file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRestoreContent(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreContent) {
      setRestoreError('يرجى اختيار ملف النسخة الاحتياطية أولاً');
      return;
    }
    if (!restorePassword) {
      setRestoreError('يرجى إدخال كلمة مرور المشرف');
      return;
    }

    setIsRestoring(true);
    setRestoreError('');
    const res = await restoreBackup(restoreContent, restorePassword);
    setIsRestoring(false);

    if (res.success) {
      alert(res.message || 'تم استرجاع النسخة الاحتياطية بنجاح!');
      setIsRestoreModalOpen(false);
      setRestoreContent('');
      setRestorePassword('');
    } else {
      setRestoreError(res.error || 'فشل استرجاع النسخة الاحتياطية');
    }
  };

  if (currentUser?.role !== 'manager') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">صلاحية محظورة</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          عذراً، شاشة الإعدادات وهوية الشركة وحماية البيانات مخصصة لمدير النظام (المسؤول) فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            <span>إعدادات النظام وهوية الشركة (Company & System Settings)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تخصيص اسم الشركة، بيانات الفواتير والوصولات، إدارة الموظفين، والنسخ الاحتياطي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>أخذ نسخة احتياطية (Backup)</span>
          </button>

          <button
            onClick={() => setIsRestoreModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>استرجاع نسخة</span>
          </button>
        </div>
      </div>

      {/* Section 1: Company Identity & Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-800">
              1. بيانات الشركة والهوية المعتمدة في الوصولات والتقارير
            </h3>
          </div>
          {settingsSaveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم حفظ الإعدادات بنجاح</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم الشركة أو المحل التجاري *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="مثال: شركة الفجر للتجارة والتقسيط"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                يظهر كعنوان رئيسي في كافة العقود وإيصالات القبض الحرارية وواجهة البرنامج
              </span>
            </div>

            {/* Primary Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهاتف الرئيسي *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07701234567"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                required
              />
            </div>

            {/* Alt Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم هاتف إضافي / واتساب
              </label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="07809876543"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان المقر أو الفرع
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: بغداد - المنصور - شارع 14 رمضان"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Commercial Register */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم السجل التجاري / الهوية الضريبية
              </label>
              <input
                type="text"
                value={commercialRegister}
                onChange={(e) => setCommercialRegister(e.target.value)}
                placeholder="مثال: CR-2026-8812"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            {/* Currency Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم العملة المستخدمة
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="دينار عراقي / ريال سعودي / دولار"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Currency Symbol */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رمز اختصار العملة (مثل: د.ع أو ر.س أو $)
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="د.ع"
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Receipt Footer Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رسالة تذييل الوصل (تطبع بأسفل إيصال القبض)
              </label>
              <textarea
                value={receiptFooterNote}
                onChange={(e) => setReceiptFooterNote(e.target.value)}
                rows={3}
                placeholder="شكراً لتعاملكم معنا، يرجى الاحتفاظ بالوصل كإثبات سداد رسمي..."
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 leading-relaxed"
              />
            </div>

            {/* Legal Terms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                شروط وأحكام عقد التقسيط (تطبع خلف العقد)
              </label>
              <textarea
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                rows={3}
                placeholder="تسدد الأقساط الشهرية في مواعيدها دون تأخير..."
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'جاري الحفظ...' : 'حفظ تعديلات الهوية والشركة'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: User Accounts & Roles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">
              2. إدارة حسابات الموظفين والمستخدمين والصلاحيات
            </h3>
          </div>

          <button
            onClick={handleOpenAddUser}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إضافة موظف / مستخدم جديد</span>
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">اسم الموظف</th>
                  <th className="py-3 px-4">اسم المستخدم</th>
                  <th className="py-3 px-4">الدور والصلاحية</th>
                  <th className="py-3 px-4">تاريخ الإنشاء</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.username}
                    </td>
                    <td className="py-3 px-4">
                      {u.role === 'manager' ? (
                        <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px]">
                          👑 مدير النظام (شامل)
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full border border-blue-200 text-[11px]">
                          💼 موظف مبيعات ومحاسبة
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {u.createdAt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="تعديل أو تغيير كلمة المرور"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Danger Zone - Delete All Customer Records */}
      <div className="bg-rose-50/50 rounded-2xl border-2 border-rose-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-rose-900">
              3. منطقة الحماية والعمليات الحرجة (حذف كافة بيانات العملاء)
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              إجراء خاص بتهيئة النظام لعميل جديد أو إعادة التصفير الشامل قبل البيع التجاري
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-800">
              حذف جميع بيانات العملاء والعقود والإيصالات
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              هذا الإجراء سيقوم بمسح كافة ملفات العملاء المسجلين، وجداول الأقساط، وإيصالات القبض نهائياً. لا يمكن التراجع عن هذا الإجراء إلا باسترجاع نسخة احتياطية. يتطلب إدخال كلمة سر المشرف حصراً.
            </p>
          </div>

          <button
            onClick={() => {
              setDangerPassword('');
              setDangerError('');
              setIsDangerModalOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف جميع بيانات العملاء</span>
          </button>
        </div>
      </div>

      {/* Modal: Add/Edit User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{editingUserId ? 'تعديل بيانات المستخدم' : 'إضافة حساب موظف جديد'}</span>
              </h4>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {userError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
                {userError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل للموظف
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: مصطفى أحمد الكرخي"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المستخدم لتسجيل الدخول
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="mustafa"
                  disabled={!!editingUserId}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 font-mono disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUserId ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600"
                  required={!editingUserId}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدور والصلاحية
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="sales">💼 موظف مبيعات ومحاسبة (إدخال عقود وتسديدات فقط)</option>
                  <option value="manager">👑 مدير النظام (صلاحيات كاملة وإعدادات وحذف)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  {editingUserId ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Danger Zone (Delete All Customers) */}
      {isDangerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-rose-900">
                تحذير أمني شديد الخطورة!
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold">
                أنت على وشك حذف كافة بيانات العملاء المسجلين، والعقود، وإيصالات السداد من هذا النظام.
              </p>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <div className="font-bold">يرجى الانتباه:</div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>سيتم إفراغ قاعدة بيانات العملاء بالكامل.</li>
                <li>لا يمكن التراجع إلا إذا كنت تملك ملف نسخة احتياطية سابقة.</li>
                <li>يجب إدخال كلمة سر المشرف (المدير) للتأكيد.</li>
              </ul>
            </div>

            {dangerError && (
              <div className="p-3 rounded-lg bg-rose-100 text-rose-900 font-bold text-xs border border-rose-300">
                {dangerError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                أدخل كلمة سر المدير (المشرف) للتأكيد:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={dangerPassword}
                  onChange={(e) => setDangerPassword(e.target.value)}
                  placeholder="كلمة مرور المشرف..."
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl pr-10 pl-3 py-2.5 border border-slate-300 focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
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
                {isDeletingAll ? 'جاري التحقق والحذف...' : 'نعم، تأكيد حذف كافة البيانات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Restore Database */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>استرجاع نسخة احتياطية من ملف</span>
              </h4>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              اختر ملف النسخة الاحتياطية (.json) الذي قمت بتحميله مسبقاً لاسترجاع بيانات الشركة والعملاء.
            </p>

            {restoreError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
                {restoreError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر ملف النسخة الاحتياطية (.json)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة سر المشرف للتأكيد
                </label>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="كلمة المرور..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmRestore}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? 'جاري الاسترجاع...' : 'استرجاع البيانات الآن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
