import { useState } from "react";
import type { Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { getProductImage } from "@/lib/productImages";
import { useLanguage } from "@/contexts/LanguageContext";
import heroProductsImg from "@/assets/hero-products.png";

interface StoreViewProps {
  products: Product[];
  cart: (Product & { qty: number })[];
  setCart: React.Dispatch<React.SetStateAction<(Product & { qty: number })[]>>;
  setSelectedProduct: (p: Product | null) => void;
  onCheckout: () => void;
}

export function StoreView({ products, cart, setCart, setSelectedProduct, onCheckout }: StoreViewProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("__all__");
  const { t, lang } = useLanguage();
  
  const cats = [{ key: "__all__", label: t.allCategories }, ...Array.from(new Set(products.map((p) => p.category))).map(c => ({ key: c, label: c }))];
  const filtered = products.filter(
    (p) => (category === "__all__" || p.category === category) && p.name.includes(search)
  );

  const addToCart = (p: Product) => {
    if (p.stock === 0) {
      toast.error(t.productUnavailable);
      return;
    }
    setCart((prev) => {
      const e = prev.find((i) => i.id === p.id);
      return e ? prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...prev, { ...p, qty: 1 }];
    });
    toast.success(t.addedToCart.replace("{name}", p.name));
  };

  return (
    <div className="fade-up">
      {/* Hero Section - matching reference */}
      <div className={`relative rounded-3xl overflow-hidden mb-10 min-h-[380px] md:min-h-[440px] flex items-center ${lang === "en" ? "flex-row" : "flex-row-reverse"}`} style={{
        background: 'linear-gradient(135deg, hsl(170 30% 92%) 0%, hsl(160 25% 95%) 40%, hsl(180 20% 97%) 100%)'
      }}>
        {/* Decorative blob */}
        <div className={`absolute top-0 w-[500px] h-[500px] opacity-30 pointer-events-none ${lang === "en" ? "left-1/4" : "right-1/4"}`} style={{
          background: 'radial-gradient(circle, hsl(162 40% 85%) 0%, transparent 70%)',
          borderRadius: '40% 60% 50% 50% / 50% 40% 60% 50%',
        }} />
        <div className={`absolute bottom-0 w-[400px] h-[400px] opacity-20 pointer-events-none ${lang === "en" ? "right-1/3" : "left-1/3"}`} style={{
          background: 'radial-gradient(circle, hsl(162 50% 80%) 0%, transparent 70%)',
          borderRadius: '60% 40% 50% 50% / 40% 60% 40% 60%',
        }} />

        {/* Text content */}
        <div className="relative z-10 p-8 md:p-14 max-w-xl flex-1">
          <h1 className={`text-[32px] md:text-[46px] font-black text-foreground leading-[1.2] mb-5 ${lang === "en" ? "text-left" : "text-right"}`}>
            <span className="text-primary">{t.heroTitle1}</span>
            <br />
            {t.heroTitle2}
          </h1>
          <p className={`text-muted-foreground text-[14px] md:text-[16px] leading-[1.9] mb-8 font-semibold max-w-md ${lang === "en" ? "text-left" : "text-right"}`}>
            {t.heroDesc}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary text-primary-foreground rounded-full px-8 py-3.5 text-sm font-bold cursor-pointer transition-all hover:shadow-store-md hover:-translate-y-0.5"
            >
              {t.heroShopNow}
            </button>
            <button className="border-2 border-foreground/20 text-foreground rounded-full px-8 py-3.5 text-sm font-bold cursor-pointer transition-all hover:bg-foreground/5">
              {t.heroOffers}
            </button>
          </div>
        </div>

        {/* Floating product images */}
        <div className="hidden md:flex items-center justify-center flex-1 z-10 p-8">
          <img
            src={heroProductsImg}
            alt="Products"
            className="w-[380px] lg:w-[480px] drop-shadow-xl"
          />
        </div>
      </div>

      {/* Category chips & Search */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-card border border-border rounded-full py-3 px-5 pr-12 text-foreground text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-store-card"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-40">🔍</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`cursor-pointer transition-all rounded-full font-bold py-2.5 px-5 text-[13px] ${
                category === c.key
                  ? "bg-primary text-primary-foreground shadow-store"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-foreground">{t.featuredProducts}</h2>
        <span className="text-primary text-sm font-bold cursor-pointer hover:underline">{t.viewAll}</span>
      </div>

      {/* Products Grid */}
      <div id="products-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p, i) => {
          const oldPrice = Math.round(p.price * 1.2);
          const discount = Math.round(((oldPrice - p.price) / oldPrice) * 100);
          const engMatch = p.name.match(/[A-Za-z0-9\s\.\-"]+/g);
          const engName = engMatch ? engMatch.join(" ").trim() : p.category;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="group cursor-pointer"
              style={{ animation: `fadeUp 0.35s ease ${i * 0.04}s both` }}
            >
              <div className="relative bg-muted/40 rounded-2xl overflow-hidden aspect-[4/5] mb-3 border border-border/40">
                <img
                  src={getProductImage(p.name, p.category)}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); toast.success(t.addedToFavorites); }}
                  className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shadow-sm"
                >
                  ♡
                </button>
                {p.badge && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-lg py-1 px-3 text-[11px] font-bold shadow-sm">
                    {p.badge}
                  </div>
                )}
                {p.stock === 0 && (
                  <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-destructive rounded-lg px-5 py-2 text-xs text-white font-bold">{t.outOfStock}</div>
                  </div>
                )}
                {p.stock > 0 && p.stock <= p.min_stock && (
                  <div className="absolute bottom-3 right-3 bg-destructive text-white rounded-lg py-1 px-3 text-[10px] font-bold animate-pulse shadow-sm">
                    {t.onlyLeft.replace("{count}", String(p.stock))}
                  </div>
                )}
              </div>

              <div className="text-center px-1">
                <div className="text-[12px] text-muted-foreground mb-0.5">{engName}</div>
                <div className="text-[14px] font-bold text-card-foreground mb-1.5 line-clamp-1">{p.name}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-warning text-[13px]">⭐</span>
                  <span className="text-primary font-bold text-[13px]">{p.rating}</span>
                  <span className="text-[11px] text-muted-foreground">({p.rating_count.toLocaleString()})</span>
                </div>
                <div className="flex items-baseline justify-center gap-2 flex-row-reverse">
                  <span className="text-[11px] font-bold text-primary">{discount}%-</span>
                  <span className="text-[13px] text-muted-foreground line-through">{oldPrice.toLocaleString()}</span>
                  <span className="text-[18px] font-black text-foreground">
                    {p.price.toLocaleString()} <span className="text-[11px] font-bold text-muted-foreground">{t.currency}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full py-3 px-7 flex gap-5 items-center z-50 shadow-store-lg slide-down">
          <span className="text-muted-foreground font-bold text-sm">🛒 {cart.reduce((s, i) => s + i.qty, 0)} {t.cartItems}</span>
          <span className="text-primary font-black text-xl">
            {cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}{" "}
            <span className="text-xs">{t.currency}</span>
          </span>
          <button
            onClick={onCheckout}
            className="bg-primary text-primary-foreground rounded-full py-2.5 px-6 font-bold cursor-pointer transition-all hover:brightness-110 shadow-store-md"
          >
            {t.checkout}
          </button>
        </div>
      )}
    </div>
  );
}
