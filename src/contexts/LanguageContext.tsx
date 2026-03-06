import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "ar" | "en";

interface Translations {
  // Navbar
  storeName: string;
  storeSubtitle: string;
  navStore: string;
  navAdmin: string;
  navDelivery: string;
  trackPlaceholder: string;
  trackBtn: string;
  // Hero
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  heroShopNow: string;
  heroOffers: string;
  // Store
  searchPlaceholder: string;
  allCategories: string;
  featuredProducts: string;
  viewAll: string;
  outOfStock: string;
  onlyLeft: string;
  addedToCart: string;
  addedToFavorites: string;
  productUnavailable: string;
  currency: string;
  cartItems: string;
  checkout: string;
  // Product Modal
  reviews: string;
  views: string;
  price: string;
  paymentMethod: string;
  cashPayment: string;
  sales: string;
  onlyPiecesLeft: string;
  addToCart: string;
  inCartAddMore: string;
  watchVideo: string;
  // Checkout
  backToStore: string;
  checkoutTitle: string;
  total: string;
  deliveryInfo: string;
  fullName: string;
  namePlaceholder: string;
  mobileNumber: string;
  city: string;
  selectCity: string;
  detailedAddress: string;
  addressPlaceholder: string;
  codTitle: string;
  codDesc: string;
  confirmOrder: string;
  sending: string;
  fillAllFields: string;
  orderCreated: string;
  orderError: string;
  orderSuccess: string;
  yourOrderNumber: string;
  trackFromBar: string;
  // Footer
  footerDesc: string;
  quickLinks: string;
  categories: string;
  contactUs: string;
  freeShipping: string;
  codPayment: string;
  returnPolicy: string;
  secureTransactions: string;
  allRightsReserved: string;
  footerLinkStore: string;
  footerLinkTrack: string;
  footerLinkReturn: string;
  footerLinkFaq: string;
  footerWorkHours: string;
  // Common
  loading: string;
  orderNotFound: string;
  statusUpdated: string;
  returnRegistered: string;
  stockUpdated: string;
  close: string;
  returnedOrder: string;
  trackOrder: string;
}

const translations: Record<Lang, Translations> = {
  ar: {
    storeName: "StoreOS",
    storeSubtitle: "متجر الإمارات",
    navStore: "المتجر",
    navAdmin: "الإدارة",
    navDelivery: "المناديب",
    trackPlaceholder: "تتبع أوردرك...",
    trackBtn: "تتبع",
    heroTitle1: "كل اللي تحتاجه",
    heroTitle2: "في مكان واحد",
    heroDesc: "تسوّق أحدث الإلكترونيات والأجهزة المنزلية والإكسسوارات بأسعار لا تُقاوم",
    heroShopNow: "تسوّق الآن",
    heroOffers: "شاهد العروض",
    searchPlaceholder: "ابحث عن منتج...",
    allCategories: "الكل",
    featuredProducts: "المنتجات المميزة",
    viewAll: "عرض الكل",
    outOfStock: "نفد المخزون",
    onlyLeft: "متبقي {count} فقط!",
    addedToCart: "✓ أُضيف: {name}",
    addedToFavorites: "تمت الإضافة للمفضلة ♥",
    productUnavailable: "المنتج غير متاح حالياً",
    currency: "د.إ",
    cartItems: "منتجات",
    checkout: "إتمام الطلب →",
    // Product Modal
    reviews: "تقييم",
    views: "مشاهدة",
    price: "السعر",
    paymentMethod: "طريقة الدفع",
    cashPayment: "💵 كاش",
    sales: "المبيعات",
    onlyPiecesLeft: "⚠️ متبقي {count} قطعة فقط!",
    addToCart: "🛒 أضف للسلة",
    inCartAddMore: "في السلة ({qty}) — أضف مزيداً",
    watchVideo: "▶ شاهد الفيديو",
    // Checkout
    backToStore: "← العودة للمتجر",
    checkoutTitle: "🛒 إتمام الطلب",
    total: "الإجمالي",
    deliveryInfo: "📋 بيانات التوصيل",
    fullName: "الاسم الكامل *",
    namePlaceholder: "مثال: أحمد الشامسي",
    mobileNumber: "رقم الموبايل *",
    city: "المدينة *",
    selectCity: "اختر المدينة...",
    detailedAddress: "العنوان التفصيلي *",
    addressPlaceholder: "المنطقة — الشارع — رقم البناية",
    codTitle: "الدفع عند الاستلام (COD)",
    codDesc: "ادفع كاش للمندوب عند استلام الطلب",
    confirmOrder: "تأكيد الطلب",
    sending: "جاري الإرسال...",
    fillAllFields: "يرجى ملء جميع الحقول",
    orderCreated: "تم إنشاء الطلب بنجاح ✓",
    orderError: "حدث خطأ أثناء إنشاء الطلب",
    orderSuccess: "تم الطلب بنجاح!",
    yourOrderNumber: "رقم أوردرك:",
    trackFromBar: "يمكنك تتبع طلبك من شريط التتبع أعلى الصفحة",
    // Footer
    footerDesc: "أفضل المنتجات في الإمارات. توصيل لجميع الإمارات مع ضمان الجودة والدفع عند الاستلام.",
    quickLinks: "روابط سريعة",
    categories: "التصنيفات",
    contactUs: "تواصل معنا",
    freeShipping: "شحن مجاني +200 د.إ",
    codPayment: "الدفع عند الاستلام",
    returnPolicy: "إرجاع خلال 14 يوم",
    secureTransactions: "تعاملات آمنة",
    allRightsReserved: "جميع الحقوق محفوظة.",
    footerLinkStore: "المتجر",
    footerLinkTrack: "تتبع الطلب",
    footerLinkReturn: "سياسة الإرجاع",
    footerLinkFaq: "الأسئلة الشائعة",
    footerWorkHours: "السبت - الخميس: 9 ص - 9 م",
    // Common
    loading: "جاري تحميل StoreOS...",
    orderNotFound: "رقم الأوردر غير موجود",
    statusUpdated: "تم تحديث حالة الأوردر ✓",
    returnRegistered: "تم تسجيل المرتجع والستوك اتحدث ✓",
    stockUpdated: "تم تحديث ستوك {name} ✓",
    close: "إغلاق",
    returnedOrder: "مرتجع",
    trackOrder: "تتبع أوردر",
  },
  en: {
    storeName: "StoreOS",
    storeSubtitle: "UAE Store",
    navStore: "Store",
    navAdmin: "Admin",
    navDelivery: "Delivery",
    trackPlaceholder: "Track your order...",
    trackBtn: "Track",
    heroTitle1: "Everything You Need",
    heroTitle2: "In One Place",
    heroDesc: "Shop the latest electronics, home appliances & accessories at unbeatable prices",
    heroShopNow: "Shop Now",
    heroOffers: "View Offers",
    searchPlaceholder: "Search for a product...",
    allCategories: "All",
    featuredProducts: "Featured Products",
    viewAll: "View All",
    outOfStock: "Out of Stock",
    onlyLeft: "Only {count} left!",
    addedToCart: "✓ Added: {name}",
    addedToFavorites: "Added to favorites ♥",
    productUnavailable: "Product currently unavailable",
    currency: "AED",
    cartItems: "items",
    checkout: "Checkout →",
    // Product Modal
    reviews: "reviews",
    views: "views",
    price: "Price",
    paymentMethod: "Payment",
    cashPayment: "💵 Cash",
    sales: "Sales",
    onlyPiecesLeft: "⚠️ Only {count} pieces left!",
    addToCart: "🛒 Add to Cart",
    inCartAddMore: "In cart ({qty}) — Add more",
    watchVideo: "▶ Watch Video",
    // Checkout
    backToStore: "← Back to Store",
    checkoutTitle: "🛒 Checkout",
    total: "Total",
    deliveryInfo: "📋 Delivery Information",
    fullName: "Full Name *",
    namePlaceholder: "e.g. Ahmed Al Shamsi",
    mobileNumber: "Mobile Number *",
    city: "City *",
    selectCity: "Select city...",
    detailedAddress: "Detailed Address *",
    addressPlaceholder: "Area — Street — Building No.",
    codTitle: "Cash on Delivery (COD)",
    codDesc: "Pay cash to the delivery agent upon receiving your order",
    confirmOrder: "Confirm Order",
    sending: "Sending...",
    fillAllFields: "Please fill all required fields",
    orderCreated: "Order created successfully ✓",
    orderError: "An error occurred while creating the order",
    orderSuccess: "Order Placed Successfully!",
    yourOrderNumber: "Your order number:",
    trackFromBar: "You can track your order from the tracking bar above",
    // Footer
    footerDesc: "Best products in UAE. Delivery across all Emirates with quality guarantee and cash on delivery.",
    quickLinks: "Quick Links",
    categories: "Categories",
    contactUs: "Contact Us",
    freeShipping: "Free shipping +200 AED",
    codPayment: "Cash on Delivery",
    returnPolicy: "14-day returns",
    secureTransactions: "Secure transactions",
    allRightsReserved: "All rights reserved.",
    footerLinkStore: "Store",
    footerLinkTrack: "Track Order",
    footerLinkReturn: "Return Policy",
    footerLinkFaq: "FAQ",
    footerWorkHours: "Sat - Thu: 9 AM - 9 PM",
    // Common
    loading: "Loading StoreOS...",
    orderNotFound: "Order not found",
    statusUpdated: "Order status updated ✓",
    returnRegistered: "Return registered & stock updated ✓",
    stockUpdated: "Stock updated for {name} ✓",
    close: "Close",
    returnedOrder: "Returned",
    trackOrder: "Track Order",
  },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: translations.ar,
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const t = translations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
