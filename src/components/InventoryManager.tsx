import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Barcode,
  Edit2,
  Trash2,
  Calculator,
  AlertTriangle,
  Check,
  Tag,
  Image as ImageIcon,
  DollarSign,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const InventoryManager: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    setSelectedProductForInstallment,
    setIsNewContractModalOpen,
    currentUser,
    globalSearch
  } = useApp();

  // Local department filter & search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formModel, setFormModel] = useState<string>('');
  const [formBarcode, setFormBarcode] = useState<string>('');
  const [formOriginalCost, setFormOriginalCost] = useState<number>(0);
  const [formSuggestedCashPrice, setFormSuggestedCashPrice] = useState<number>(0);
  const [formSpecs, setFormSpecs] = useState<string>('');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filtered categories that accept products (exclude pure cash loans)
  const productCategories = categories.filter(c => c.type !== 'cash_loans');

  // Filter products: by global search OR local search + category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategoryFilter !== 'all' && p.categoryId !== selectedCategoryFilter) {
        return false;
      }

      // Search term (use globalSearch if present, else localSearch)
      const term = (globalSearch || localSearch).toLowerCase().trim();
      if (!term) return true;

      return (
        p.name.toLowerCase().includes(term) ||
        p.model.toLowerCase().includes(term) ||
        p.barcode.toLowerCase().includes(term) ||
        p.specs.toLowerCase().includes(term) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(term))
      );
    });
  }, [products, selectedCategoryFilter, localSearch, globalSearch]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(productCategories[0]?.id || '');
    setFormModel('');
    setFormBarcode(`${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    setFormOriginalCost(0);
    setFormSuggestedCashPrice(0);
    setFormSpecs('');
    setFormQuantity(1);
    setFormImageUrl('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategoryId(p.categoryId);
    setFormModel(p.model);
    setFormBarcode(p.barcode);
    setFormOriginalCost(p.originalCost);
    setFormSuggestedCashPrice(p.suggestedCashPrice);
    setFormSpecs(p.specs);
    setFormQuantity(p.quantity);
    setFormImageUrl(p.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategoryId) return;

    setIsSaving(true);
    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: formName,
        categoryId: formCategoryId,
        model: formModel,
        barcode: formBarcode,
        originalCost: formOriginalCost,
        suggestedCashPrice: formSuggestedCashPrice,
        specs: formSpecs,
        quantity: formQuantity,
        imageUrl: formImageUrl
      });
    } else {
      await addProduct({
        name: formName,
        categoryId: formCategoryId,
        model: formModel,
        barcode: formBarcode,
        originalCost: formOriginalCost,
        suggestedCashPrice: formSuggestedCashPrice,
        specs: formSpecs,
        quantity: formQuantity,
        imageUrl: formImageUrl
      });
    }
    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (p: Product) => {
    if (confirm(`هل أنت متأكد من حذف المنتج "${p.name}" من المخزون؟`)) {
      await deleteProduct(p.id);
    }
  };

  const handleStartInstallmentSale = (p: Product) => {
    setSelectedProductForInstallment(p);
    setIsNewContractModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>إدارة المخزون والأجهزة الإلكترونية والكهربائية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل تفاصيل الأجهزة، الأسعار الأصلية، الأرقام التسلسلية والباركود، والتحويل للتقسيط بنقرة واحدة
          </p>
        </div>

        {currentUser.permissions.canManageProducts && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة جهاز / منتج جديد</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Advanced Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap pl-2">
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية حسب القسم:</span>
          </span>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategoryFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الأقسام ({products.length})
          </button>
          {productCategories.map((cat) => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dedicated Search within section or barcode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="بحث مخصص داخل القسم الحالي (اسم الموديل، الباركود، المواصفات...)"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <Barcode className="w-4 h-4 text-slate-600" />
            <span>البحث بالباركود مدعوم تلقائياً (قارئ الباركود متوافق)</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">لم يتم العثور على أجهزة مطابقة للبحث أو القسم المحدد</p>
            <p className="text-xs text-slate-400 mt-1">يمكنك تغيير القسم أو إضافة أجهزة جديدة للمخزون.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock = product.quantity <= 3;
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden group">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                      {product.categoryName || 'قسم عام'}
                    </div>
                    {isLowStock && (
                      <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                        <AlertTriangle className="w-3 h-3" />
                        <span>مخزون حرج: {product.quantity}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 leading-snug line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[11px] text-slate-600">
                          {product.model}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>{product.barcode}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.specs || 'لا تتوفر مواصفات إضافية'}
                    </p>

                    {/* Price Breakdown */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">السعر الأصلي (التكلفة):</span>
                        <strong className="text-slate-700 font-mono">
                          {product.originalCost.toLocaleString()} د.ع
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">سعر البيع نقداً (الكاش):</span>
                        <strong className="text-emerald-600 font-bold font-mono">
                          {product.suggestedCashPrice.toLocaleString()} د.ع
                        </strong>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="text-slate-500">الكمية المتوفرة:</span>
                        <span className={`font-bold font-mono ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                          {product.quantity} جهاز
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handleStartInstallmentSale(product)}
                    disabled={product.quantity <= 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>بيع هذا الجهاز بالتقسيط</span>
                  </button>

                  {currentUser.permissions.canManageProducts && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>{editingProduct ? 'تعديل بيانات الجهاز' : 'تسجيل جهاز / منتج جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الجهاز الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثلاً: آيفون 15 برو ماكس 256GB تيتانيوم"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القسم التابع له *
                  </label>
                  <select
                    required
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500"
                  >
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الموديل / الطراز
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="مثلاً: A3106 أو ASGA24"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الباركود / السيريال نمر
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="يمكن المسح بالباركود مباشرة"
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الكمية المتوفرة بالمخزن *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر الأصلي (تكلفة الشراء) د.ع *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formOriginalCost}
                    onChange={(e) => setFormOriginalCost(Number(e.target.value))}
                    className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg p-2.5 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    سعر البيع نقداً (الكاش المقترح) د.ع *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formSuggestedCashPrice}
                    onChange={(e) => setFormSuggestedCashPrice(Number(e.target.value))}
                    className="w-full text-xs font-bold text-emerald-600 bg-white border border-slate-300 rounded-lg p-2.5 focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رابط صورة الجهاز
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مواصفات الجهاز وملاحظات الضمان
                  </label>
                  <textarea
                    rows={2}
                    value={formSpecs}
                    onChange={(e) => setFormSpecs(e.target.value)}
                    placeholder="سعة الذاكرة، حجم الشاشة، تفاصيل الضمان..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:border-blue-500"
                  />
                </div>
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
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الجهاز في المخزن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
