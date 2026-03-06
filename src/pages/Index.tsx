import { useState } from "react";
import { toast } from "sonner";
import { useProducts, useUpdateStock, type Product } from "@/hooks/useProducts";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useReturns, useCreateReturn } from "@/hooks/useReturns";
import { useAgents } from "@/hooks/useAgents";
import { STATUS_CFG, type OrderStatus } from "@/lib/constants";
import { StoreView } from "@/components/store/StoreView";
import { AdminView } from "@/components/store/AdminView";
import { DeliveryView } from "@/components/store/DeliveryView";
import { ProductModal } from "@/components/store/ProductModal";
import { CheckoutView } from "@/components/store/CheckoutView";
import { NotificationBell } from "@/components/store/NotificationBell";
import { Footer } from "@/components/store/Footer";
import { StatusBadge } from "@/components/store/SharedComponents";
import { LanguageToggle } from "@/components/store/LanguageToggle";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

function IndexInner() {
  const [view, setView] = useState<"store" | "admin" | "delivery" | "checkout">("store");
  const [cart, setCart] = useState<(Product & { qty: number })[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackInput, setTrackInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { t, lang, dir } = useLanguage();

  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: orders = [], isLoading: loadingOrders } = useOrders();
  const { data: returns = [] } = useReturns();
  const { data: agents = [] } = useAgents();

  const updateStatusMutation = useUpdateOrderStatus();
  const updateStockMutation = useUpdateStock();
  const createReturnMutation = useCreateReturn();

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status }, {
      onSuccess: () => toast.success(t.statusUpdated),
    });
  };

  const handleAddReturn = (orderId: string, productName: string, reason: string, qty: number) => {
    createReturnMutation.mutate({ order_id: orderId, product_name: productName, reason, qty }, {
      onSuccess: () => toast.success(t.returnRegistered),
    });
  };

  const handleUpdateStock = (productId: number, change: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateStockMutation.mutate({ id: productId, newStock: product.stock + change }, {
      onSuccess: () => toast.success(t.stockUpdated.replace("{name}", product.name)),
    });
  };

  const handleTrack = () => {
    const o = orders.find((x) => x.id.toLowerCase() === trackInput.toLowerCase());
    setTrackedOrder(o || null);
    if (!o) toast.error(t.orderNotFound);
  };

  const handleNavClick = (target: "store" | "admin" | "delivery") => {
    setView(target);
    setMobileMenuOpen(false);
  };

  const navTabs = [
    { key: "store" as const, icon: "🛍️", label: t.navStore },
    { key: "admin" as const, icon: "⚙️", label: t.navAdmin },
    { key: "delivery" as const, icon: "🚴", label: t.navDelivery },
  ];

  if (loadingProducts || loadingOrders) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🛍️</div>
          <div className="text-lg font-bold text-muted-foreground">{t.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-cairo" dir={dir}>
      {/* NAVBAR */}
      <nav className="bg-nav sticky top-0 z-[100] shadow-store">
        <div className="max-w-7xl mx-auto px-4 md:px-5 h-[60px] md:h-[65px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView("store"); setMobileMenuOpen(false); }}>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center text-base md:text-lg">
              🛍️
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold text-white leading-none tracking-wide" style={{ fontFamily: "'Cairo', sans-serif", letterSpacing: '0.02em' }}>{t.storeName}</div>
              <div className="text-[9px] md:text-[10px] font-semibold text-white/50 mt-0.5">{t.storeSubtitle}</div>
            </div>
          </div>

          {/* Desktop Nav tabs */}
          <div className="hidden md:flex gap-1 bg-white/10 rounded-full p-1">
            {navTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleNavClick(tab.key)}
                className={`cursor-pointer transition-all rounded-full font-bold py-2 px-5 text-[13px] ${
                  view === tab.key
                    ? "bg-white text-primary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop Right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <div className="relative">
              <input
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder={t.trackPlaceholder}
                className="w-[160px] bg-white/10 border border-white/20 rounded-full py-2 px-3.5 pr-9 text-[13px] text-white placeholder:text-white/40 transition-colors focus:bg-white/15 focus:border-white/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-50">🔍</span>
            </div>
            <button
              onClick={handleTrack}
              className="bg-white text-primary rounded-full py-2 px-4 text-[13px] font-bold cursor-pointer transition-all hover:brightness-105"
            >
              {t.trackBtn}
            </button>

            <NotificationBell />

            {cart.length > 0 && (
              <button
                onClick={() => setView("checkout")}
                className="bg-white/15 text-white border border-white/20 rounded-full py-2 px-3.5 text-[13px] font-bold cursor-pointer transition-all hover:bg-white/25 relative"
              >
                🛒 {cart.reduce((s, i) => s + i.qty, 0)}
              </button>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            {cart.length > 0 && (
              <button
                onClick={() => setView("checkout")}
                className="bg-white/15 text-white rounded-full py-1.5 px-3 text-xs font-bold"
              >
                🛒 {cart.reduce((s, i) => s + i.qty, 0)}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-lg cursor-pointer text-white"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-nav px-4 py-4 space-y-3 slide-down">
            {navTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleNavClick(tab.key)}
                className={`w-full cursor-pointer transition-all rounded-full font-bold py-3 px-5 text-sm ${dir === "rtl" ? "text-right" : "text-left"} ${
                  view === tab.key
                    ? "bg-white text-primary"
                    : "bg-white/10 text-white/70 border border-white/10"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            <div className="flex gap-2">
              <input
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder={t.trackPlaceholder}
                className="flex-1 bg-white/10 border border-white/20 rounded-full py-2.5 px-4 text-sm text-white placeholder:text-white/40"
              />
              <button onClick={handleTrack} className="bg-white text-primary rounded-full py-2.5 px-4 text-sm font-bold">
                {t.trackBtn}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* TRACKER BANNER */}
      {trackedOrder && view === "store" && (
        <div className="bg-surface-alt border-b border-border slide-down">
          <div className="max-w-7xl mx-auto px-4 md:px-5 py-4 md:py-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm md:text-[15px] font-extrabold text-foreground mb-3">
                📦 {lang === "ar" ? `تتبع أوردر #${trackedOrder.id} — ${trackedOrder.customer}` : `Track Order #${trackedOrder.id} — ${trackedOrder.customer}`}
              </div>
              <div className="flex items-center gap-0 overflow-x-auto">
                {(["pending", "preparing", "on_way", "delivered"] as OrderStatus[]).map((s, i) => {
                  const steps: OrderStatus[] = ["pending", "preparing", "on_way", "delivered"];
                  const curIdx = steps.indexOf(trackedOrder.status === "returned" ? "pending" : trackedOrder.status);
                  const done = i <= curIdx;
                  const current = s === trackedOrder.status;
                  return (
                    <div key={s} className="flex items-center">
                      <div className="text-center">
                        <div
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm md:text-base mx-auto mb-1 ${
                            done
                              ? current
                                ? "bg-primary text-primary-foreground shadow-store"
                                : "bg-success text-success-foreground"
                              : "bg-border text-muted-foreground"
                          }`}
                        >
                          {STATUS_CFG[s].icon}
                        </div>
                        <div className={`text-[9px] md:text-[10px] font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {STATUS_CFG[s].label}
                        </div>
                      </div>
                      {i < 3 && <div className={`w-6 md:w-10 h-0.5 mx-0.5 md:mx-1 ${i < curIdx ? "bg-success" : "bg-border"}`} />}
                    </div>
                  );
                })}
                {trackedOrder.status === "returned" && (
                  <div className="text-destructive font-extrabold text-xs md:text-sm mr-4">↩️ {t.returnedOrder}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => setTrackedOrder(null)}
              className="bg-muted text-muted-foreground py-2 px-4 text-xs border border-border rounded-xl font-bold cursor-pointer transition-all hover:brightness-110"
            >
              ✕ {t.close}
            </button>
          </div>
        </div>
      )}

      {/* PAGE */}
      <div className="max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-8">
        {view === "store" && (
          <StoreView
            products={products}
            cart={cart}
            setCart={setCart}
            setSelectedProduct={setSelectedProduct}
            onCheckout={() => setView("checkout")}
          />
        )}
        {view === "checkout" && (
          <CheckoutView cart={cart} setCart={setCart} onBack={() => setView("store")} />
        )}
        {view === "admin" && (
          <AdminView
            products={products}
            orders={orders}
            returns={returns}
            agents={agents}
            onUpdateStatus={handleUpdateStatus}
            onAddReturn={handleAddReturn}
            onUpdateStock={handleUpdateStock}
          />
        )}
        {view === "delivery" && (
          <DeliveryView
            orders={orders}
            agents={agents}
            onUpdateStatus={handleUpdateStatus}
            onAddReturn={handleAddReturn}
          />
        )}
      </div>

      {view === "store" && <Footer />}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cart={cart}
          setCart={setCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default function Index() {
  return (
    <LanguageProvider>
      <IndexInner />
    </LanguageProvider>
  );
}
