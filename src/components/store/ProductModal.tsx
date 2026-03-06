import type { Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { getProductImage } from "@/lib/productImages";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductModalProps {
  product: Product;
  cart: (Product & { qty: number })[];
  setCart: React.Dispatch<React.SetStateAction<(Product & { qty: number })[]>>;
  onClose: () => void;
}

export function ProductModal({ product, cart, setCart, onClose }: ProductModalProps) {
  const inCart = cart.find((i) => i.id === product.id);
  const formatViews = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
  const { t } = useLanguage();

  const addToCart = () => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const e = prev.find((i) => i.id === product.id);
      return e
        ? prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...product, qty: 1 }];
    });
    toast.success(t.addedToCart.replace("{name}", product.name));
  };

  return (
    <div className="fixed inset-0 bg-foreground/30 z-[200] flex items-center justify-center p-5 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-3xl w-full max-w-[560px] max-h-[88vh] overflow-auto scale-in shadow-store-lg" onClick={(e) => e.stopPropagation()}>
        <div className="bg-accent h-[220px] flex items-center justify-center relative rounded-t-3xl">
          <img src={getProductImage(product.name, product.category)} alt={product.name} className="h-full w-full object-contain p-8" />
          {product.badge && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full py-1 px-4 text-xs font-extrabold">
              {product.badge}
            </div>
          )}
          {product.video && (
            <div className="absolute bottom-4 right-4 bg-destructive text-white rounded-full py-2 px-5 text-[13px] font-extrabold cursor-pointer shadow-store-md">
              {t.watchVideo}
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-sm cursor-pointer hover:bg-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-7">
          <div className="text-xs text-primary font-bold mb-1.5">{product.category}</div>
          <h2 className="text-[22px] font-black text-foreground mb-2.5">{product.name}</h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-warning">⭐</span>
              <span className="text-sm font-bold text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.rating_count} {t.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm">👁</span>
              <span className="text-xs text-muted-foreground">{formatViews(product.views)} {t.views}</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-[1.8] mb-6">{product.description}</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { l: t.price, v: `${product.price} ${t.currency}`, c: "text-primary" },
              { l: t.paymentMethod, v: t.cashPayment, c: "text-success" },
              { l: t.sales, v: `🔥 ${product.sales}+`, c: "text-warning" },
            ].map((f, i) => (
              <div key={i} className="bg-accent rounded-2xl p-3 border border-border">
                <div className="text-[11px] text-muted-foreground mb-1">{f.l}</div>
                <div className={`text-[15px] font-black ${f.c}`}>{f.v}</div>
              </div>
            ))}
          </div>

          {product.stock > 0 && product.stock <= product.min_stock && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-3 mb-4 text-center">
              <span className="text-destructive font-extrabold text-sm animate-pulse">
                {t.onlyPiecesLeft.replace("{count}", String(product.stock))}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              disabled={product.stock === 0}
              onClick={addToCart}
              className={`flex-1 rounded-full py-3.5 text-[15px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                product.stock === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground shadow-store-md"
              }`}
            >
              {product.stock === 0
                ? t.outOfStock
                : inCart
                ? t.inCartAddMore.replace("{qty}", String(inCart.qty))
                : t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
