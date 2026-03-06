import { useState } from "react";
import { toast } from "sonner";
import type { Product, ProductInsert } from "@/hooks/useProducts";
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";

interface ProductManagementProps {
  products: Product[];
}

const CATEGORIES = ["إلكترونيات", "ملحقات", "إكسسوار", "أجهزة منزلية", "حماية وشاشات", "صوتيات"];
const EMOJIS = ["📱", "💻", "🖥️", "🎧", "⌨️", "🖱️", "📦", "🎮", "📸", "🔌", "🔋", "💡", "🖨️", "📺", "⌚"];

const emptyForm: ProductInsert = {
  name: "",
  category: "",
  price: 0,
  stock: 0,
  min_stock: 5,
  image: "📦",
  video: false,
  description: null,
  badge: null,
};

export function ProductManagement({ products }: ProductManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductInsert>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const filtered = products.filter((p) => p.name.includes(search) || p.category.includes(search));

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      min_stock: p.min_stock,
      image: p.image,
      video: p.video,
      description: p.description,
      badge: p.badge,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.category || form.price <= 0) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, ...form },
        {
          onSuccess: () => {
            toast.success("تم تحديث المنتج ✓");
            resetForm();
          },
          onError: () => toast.error("حدث خطأ أثناء التحديث"),
        }
      );
    } else {
      createProduct.mutate(form, {
        onSuccess: () => {
          toast.success("تم إضافة المنتج ✓");
          resetForm();
        },
        onError: () => toast.error("حدث خطأ أثناء الإضافة"),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success("تم حذف المنتج ✓");
        setDeleteConfirm(null);
      },
      onError: () => toast.error("حدث خطأ أثناء الحذف - قد يكون مرتبط بطلبات"),
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="text-base font-extrabold text-foreground">🏪 إدارة المنتجات ({products.length})</div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن منتج..."
              className="w-[200px] bg-surface-alt border border-border rounded-xl py-2 px-3.5 pr-9 text-sm text-foreground transition-colors focus:border-primary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary text-primary-foreground rounded-xl py-2.5 px-5 text-xs font-bold cursor-pointer transition-all hover:brightness-110 shadow-store"
          >
            ➕ إضافة منتج
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-store-md scale-in">
          <div className="flex justify-between items-center mb-5">
            <div className="text-[15px] font-extrabold text-foreground">
              {editingId ? "✏️ تعديل المنتج" : "➕ إضافة منتج جديد"}
            </div>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground text-lg cursor-pointer">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">اسم المنتج *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: سماعة بلوتوث لاسلكية"
                className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">التصنيف *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors"
              >
                <option value="">اختر تصنيف</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">السعر (د.إ) *</label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="199"
                className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">الكمية في المخزون</label>
              <input
                type="number"
                value={form.stock || ""}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                placeholder="50"
                className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors"
              />
            </div>

            {/* Min Stock */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">الحد الأدنى للمخزون</label>
              <input
                type="number"
                value={form.min_stock || ""}
                onChange={(e) => setForm({ ...form, min_stock: parseInt(e.target.value) || 5 })}
                placeholder="5"
                className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">شارة (اختياري)</label>
              <input
                value={form.badge || ""}
                onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
                placeholder="مثال: الأكثر مبيعاً"
                className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">وصف المنتج</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="وصف تفصيلي للمنتج..."
              rows={3}
              className="w-full bg-surface-alt border border-border rounded-xl py-2.5 px-4 text-sm text-foreground focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Emoji picker & Video toggle */}
          <div className="flex flex-wrap gap-4 items-start mb-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">أيقونة المنتج</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm({ ...form, image: e })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-all ${
                      form.image === e
                        ? "bg-primary text-primary-foreground shadow-store"
                        : "bg-surface-alt border border-border hover:border-primary"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <label className="text-xs font-bold text-muted-foreground">يحتوي فيديو؟</label>
              <button
                onClick={() => setForm({ ...form, video: !form.video })}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer ${
                  form.video ? "bg-primary" : "bg-border"
                }`}
              >
                <div className={`w-5 h-5 bg-card rounded-full transition-transform shadow-sm ${
                  form.video ? "translate-x-1" : "translate-x-6"
                }`} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
              className="bg-primary text-primary-foreground rounded-xl py-2.5 px-6 text-sm font-bold cursor-pointer transition-all hover:brightness-110 shadow-store disabled:opacity-50"
            >
              {createProduct.isPending || updateProduct.isPending ? "جاري الحفظ..." : editingId ? "💾 حفظ التعديلات" : "➕ إضافة المنتج"}
            </button>
            <button
              onClick={resetForm}
              className="bg-muted text-muted-foreground rounded-xl py-2.5 px-6 text-sm font-bold cursor-pointer transition-all hover:brightness-110"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-5 shadow-store transition-all hover:shadow-store-md">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Image */}
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl">{p.image}</div>

              {/* Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="font-extrabold text-foreground text-sm mb-0.5">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {p.price} د.إ · مخزون: {p.stock}</div>
                {p.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</div>
                )}
              </div>

              {/* Badges */}
              <div className="flex gap-2 items-center flex-wrap">
                {p.badge && (
                  <span className="bg-badge-hot/10 text-badge-hot rounded-lg py-0.5 px-2.5 text-[10px] font-extrabold">🔥 {p.badge}</span>
                )}
                {p.video && (
                  <span className="bg-destructive/10 text-destructive rounded-lg py-0.5 px-2.5 text-[10px] font-extrabold">▶ فيديو</span>
                )}
                <span className={`rounded-lg py-0.5 px-2.5 text-[10px] font-extrabold ${
                  p.stock === 0 ? "bg-destructive/10 text-destructive" : p.stock <= p.min_stock ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}>
                  {p.stock === 0 ? "نفد" : p.stock <= p.min_stock ? `متبقي ${p.stock}` : `${p.stock} متاح`}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-3 items-center text-xs text-muted-foreground">
                <span>⭐ {p.rating}</span>
                <span>👁 {p.views}</span>
                <span>🔥 {p.sales} مبيعة</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-primary/10 text-primary rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  ✏️ تعديل
                </button>
                {deleteConfirm === p.id ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleteProduct.isPending}
                      className="bg-destructive text-destructive-foreground rounded-xl py-2 px-3 text-xs font-bold cursor-pointer"
                    >
                      {deleteProduct.isPending ? "..." : "تأكيد"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="bg-muted text-muted-foreground rounded-xl py-2 px-3 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    className="bg-destructive/10 text-destructive rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all hover:bg-destructive hover:text-destructive-foreground"
                  >
                    🗑️ حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-16 bg-card rounded-xl border border-border">
            لا توجد منتجات مطابقة للبحث
          </div>
        )}
      </div>
    </div>
  );
}
