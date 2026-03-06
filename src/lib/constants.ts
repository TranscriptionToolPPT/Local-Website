export const STATUS_CFG = {
  pending:   { label: "في الانتظار",   color: "warning",     icon: "⏳" },
  preparing: { label: "جاري التجهيز", color: "primary",     icon: "📦" },
  on_way:    { label: "في الطريق",    color: "purple",      icon: "🚴" },
  delivered: { label: "تم التسليم",   color: "success",     icon: "✅" },
  returned:  { label: "مرتجع",        color: "destructive", icon: "↩️" },
} as const;

export type OrderStatus = keyof typeof STATUS_CFG;

export const RETURN_REASONS = [
  "منتج تالف",
  "غير مطابق للوصف",
  "خطأ في الإرسال",
  "العميل غير موجود",
  "رفض العميل الاستلام",
  "طلب العميل الإلغاء",
  "منتج مستعمل مسبقاً",
];

export const UAE_CITIES = [
  "دبي",
  "أبوظبي",
  "الشارقة",
  "عجمان",
  "رأس الخيمة",
  "الفجيرة",
  "أم القيوين",
  "العين",
];
