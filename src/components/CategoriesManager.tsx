import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Tv,
  Laptop,
  Smartphone,
  Banknote,
  Folder,
  Package,
  ArrowLeft,
  AlertCircle,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';

export const CategoriesManager: React.FC = () => {
  const {
    categories,
    products,
    contracts,
    addCategory,
    updateCategory,
    deleteCategory,
    setActiveTab,
    currentUser
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIcon, setFormIcon] = useState<string>('Folder');
  const [formType, setFormType] = useState<'products' | 'cash_loans'>('products');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const iconOptions = [
    { name: 'Tv', label: 'أجهزة كهربائية وشاشات', icon: Tv },
    { name: 'Laptop', label: 'إلكترونيات ولابتوب', icon: Laptop },
    { name: 'Smartphone', label: 'هواتف ذكية', icon: Smartphone },
    { name: 'Banknote', label: 'قروض نقدية وتمويل', icon: Banknote },
    { name: 'Folder', label: 'تصنيف عام', icon: Folder }
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Tv': return Tv;
      case 'Laptop': return Laptop;
      case 'Smartphone': return Smartphone;
      case 'Banknote': return Banknote;
      default: return Folder;
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormIcon('Folder');
    setFormType('products');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormIcon(cat.icon);
    setFormType(cat.type);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('يرجى كتابة اسم القسم');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    if (editingCategory) {
      const ok = await updateCategory(editingCategory.id, {
        name: formName,
        description: formDescription,
        icon: formIcon,
        type: formType
      });
      if (ok) {
        setIsModalOpen(false);
      } else {
        setErrorMessage('تعذر تحديث القسم، يرجى المحاولة ثانية');
      }
    } else {
      const ok = await addCategory({
        name: formName,
        description: formDescription,
        icon: formIcon,
        type: formType
      });
      if (ok) {
        setIsModalOpen(false);
      } else {
        setErrorMessage('تعذر إضافة القسم، يرجى المحاولة ثانية');
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (cat: Category) => {
    const productCount = products.filter(p => p.categoryId === cat.id).length;
    if (productCount > 0) {
      alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${productCount} جهاز أو منتج مسجل.`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف القسم "${cat.name}"؟`)) {
      const res = await deleteCategory(cat.id);
      if (!res.success) {
        alert(res.error || 'تعذر حذف القسم');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>إدارة الأقسام وتصنيفات الشركة الرئيسية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إضافة وتعديل الأقسام (الأجهزة الكهربائية، الإلكترونيات، الهواتف الذكية، والقروض النقدية) وربط المنتجات بها
          </p>
        </div>

        {currentUser.permissions.canManageCategories && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قسم رئيسي جديد</span>
          </button>
        )}
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon);
          const categoryProducts = products.filter(p => p.categoryId === category.id);
          const isCashLoan = category.type === 'cash_loans';
          const loanContractsCount = isCashLoan
            ? contracts.filter(c => c.type === 'cash_loan').length
            : 0;

          return (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isCashLoan
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {currentUser.permissions.canManageCategories && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="تعديل القسم"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-800 mt-4">{category.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px] leading-relaxed">
                  {category.description || 'لا يوجد وصف مضاف لهذا القسم'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {isCashLoan ? 'عقود القروض النشطة:' : 'المنتجات المسجلة:'}
                  </span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {isCashLoan ? `${loanContractsCount} عقد تمويل` : `${categoryProducts.length} منتج`}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => {
                    if (isCashLoan) {
                      setActiveTab('contracts');
                    } else {
                      setActiveTab('products');
                    }
                  }}
                  className="w-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{isCashLoan ? 'عرض عقود القروض النقدية' : 'تصفح أجهزة هذا القسم'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{editingCategory ? 'تعديل القسم' : 'إضافة قسم رئيسي جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم القسم *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثلاً: قسم الأجهزة الكهربائية، قسم الهواتف الذكية"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع النشاط
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'products' | 'cash_loans')}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:border-blue-500"
                >
                  <option value="products">أجهزة ومنتجات ملموسة (أجهزة، إلكترونيات، هواتف)</option>
                  <option value="cash_loans">خدمة قروض نقدية بالتقسيط</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أيقونة القسم المعبرة
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {iconOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = formIcon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormIcon(opt.name)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 text-blue-800 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف القسم
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="وصف مختصر للأصناف التابعة لهذا القسم"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ القسم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
