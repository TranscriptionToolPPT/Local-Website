import { useState } from "react";
import { toast } from "sonner";
import { UAE_CITIES } from "@/lib/constants";
import type { Product } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useLanguage } from "@/contexts/LanguageContext";

interface CheckoutViewProps {
  cart: (Product & { qty: number })[];
  setCart: React.Dispatch<React.SetStateAction<(Product & { qty: number })[]>>;
  onBack: () => void;
}

export function CheckoutView({ cart, setCart, onBack }: CheckoutViewProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!name || phone.length < 10 || !city || !address) {
      toast.error(t.fillAllFields);
      return;
    }
    try {
      const orderId = await createOrder.mutateAsync({
        customer: name,
        phone,
        address: `${city} — ${address}`,
        total,
        items: cart.map((i) => ({
          product_id: i.id,
          product_name: i.name,
          qty: i.qty,
          price: i.price,
        })),
      });
      setOrderPlaced(orderId);
      setCart([]);
      toast.success(t.orderCreated);
    } catch {
      toast.error(t.orderError);
    }
  };

  if (orderPlaced) {
    return (
      <div className="fade-up max-w-lg mx-auto text-center py-20">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-black text-foreground mb-3">{t.orderSuccess}</h2>
        <p className="text-muted-foreground mb-2">{t.yourOrderNumber}</p>
        <div className="text-3xl font-black text-primary mb-6">{orderPlaced}</div>
        <p className="text-muted-foreground text-sm mb-8">{t.trackFromBar}</p>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl py-3 px-8 font-bold cursor-pointer transition-all hover:-translate-y-0.5 shadow-store-md"
        >
          {t.backToStore}
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-muted-foreground text-sm font-bold cursor-pointer hover:text-primary transition-colors"
      >
        {t.backToStore}
      </button>

      <h2 className="text-xl font-black text-foreground mb-6">{t.checkoutTitle}</h2>

      <div className="bg-card border-[1.5px] border-border rounded-xl p-5 mb-6 shadow-store">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-border-light last:border-0">
            <div className="flex gap-3 items-center">
              <span className="text-2xl">{item.image}</span>
              <div>
                <div className="text-sm font-bold text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">× {item.qty}</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-primary font-black">{(item.price * item.qty).toLocaleString()} {t.currency}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCart((prev) => prev.map((i) => (i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)))}
                  className="w-7 h-7 rounded-lg bg-surface-alt border border-border text-sm font-bold cursor-pointer"
                >-</button>
                <button
                  onClick={() => setCart((prev) => prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)))}
                  className="w-7 h-7 rounded-lg bg-surface-alt border border-border text-sm font-bold cursor-pointer"
                >+</button>
                <button
                  onClick={() => setCart((prev) => prev.filter((i) => i.id !== item.id))}
                  className="w-7 h-7 rounded-lg bg-destructive-soft text-destructive border border-destructive/20 text-sm font-bold cursor-pointer"
                >×</button>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-border">
          <span className="font-bold text-foreground">{t.total}</span>
          <span className="text-xl font-black text-primary">{total.toLocaleString()} {t.currency}</span>
        </div>
      </div>

      <div className="bg-card border-[1.5px] border-border rounded-xl p-5 shadow-store">
        <h3 className="text-base font-extrabold text-foreground mb-5">{t.deliveryInfo}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 font-bold">{t.fullName}</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-alt border-[1.5px] border-border rounded-xl py-[11px] px-4 text-foreground text-sm transition-colors focus:border-primary focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
              placeholder={t.namePlaceholder} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 font-bold">{t.mobileNumber}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-alt border-[1.5px] border-border rounded-xl py-[11px] px-4 text-foreground text-sm transition-colors focus:border-primary focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
              placeholder="+971 50 123 4567" dir="ltr" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 font-bold">{t.city}</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full bg-surface-alt border-[1.5px] border-border rounded-xl py-[11px] px-4 text-foreground text-sm transition-colors focus:border-primary focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]">
              <option value="">{t.selectCity}</option>
              {UAE_CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 font-bold">{t.detailedAddress}</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-surface-alt border-[1.5px] border-border rounded-xl py-[11px] px-4 text-foreground text-sm transition-colors focus:border-primary focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
              placeholder={t.addressPlaceholder} />
          </div>
        </div>

        <div className="bg-success-soft border-[1.5px] border-success/30 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">💵</span>
          <div>
            <div className="text-sm font-extrabold text-success">{t.codTitle}</div>
            <div className="text-xs text-muted-foreground">{t.codDesc}</div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={createOrder.isPending}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-xl py-4 text-base font-bold cursor-pointer transition-all hover:-translate-y-0.5 shadow-store-md disabled:opacity-70">
          {createOrder.isPending ? t.sending : `${t.confirmOrder} — ${total.toLocaleString()} ${t.currency}`}
        </button>
      </div>
    </div>
  );
}
