import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge, ActionBtn } from "./SharedComponents";
import { ReturnModal } from "./ReturnModal";
import { STATUS_CFG, RETURN_REASONS, UAE_CITIES, type OrderStatus } from "@/lib/constants";
import type { Product } from "@/hooks/useProducts";
import type { Order } from "@/hooks/useOrders";
import type { Return } from "@/hooks/useReturns";
import type { Agent } from "@/hooks/useAgents";
import { useInventoryMovements } from "@/hooks/useInventoryMovements";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useCoupons, useCreateCoupon, useToggleCoupon } from "@/hooks/useCoupons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProductManagement } from "./ProductManagement";

interface AdminViewProps {
  products: Product[];
  orders: Order[];
  returns: Return[];
  agents: Agent[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onAddReturn: (orderId: string, productName: string, reason: string, qty: number) => void;
  onUpdateStock: (productId: number, change: number) => void;
}

export function AdminView({ products, orders, returns, agents, onUpdateStatus, onAddReturn, onUpdateStock }: AdminViewProps) {
  const [tab, setTab] = useState("dashboard");
  const [returnModal, setReturnModal] = useState<Order | null>(null);
  const [stockEdit, setStockEdit] = useState<Record<number, string>>({});
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", maxUses: "" });

  const { data: movements = [] } = useInventoryMovements();
  const { data: activityLog = [] } = useActivityLog();
  const { data: coupons = [] } = useCoupons();
  const createCoupon = useCreateCoupon();
  const toggleCoupon = useToggleCoupon();

  const revenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => ["pending", "preparing"].includes(o.status)).length;
  const retRate = orders.length ? ((orders.filter((o) => o.status === "returned").length / orders.length) * 100).toFixed(1) : "0";
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.min_stock);
  const outOfStock = products.filter((p) => p.stock === 0);

  const today = new Date().toISOString().slice(0, 10);
  const thisWeekStart = new Date(Date.now() - 7 * 86400000).toISOString();
  const thisMonthStart = new Date(Date.now() - 30 * 86400000).toISOString();
  const ordersToday = orders.filter((o) => o.created_at.slice(0, 10) === today).length;
  const ordersWeek = orders.filter((o) => o.created_at >= thisWeekStart).length;
  const ordersMonth = orders.filter((o) => o.created_at >= thisMonthStart).length;

  // Best agent this week
  const agentStats = agents.map((a) => {
    const ao = orders.filter((o) => o.agent_id === a.id && o.created_at >= thisWeekStart);
    const delivered = ao.filter((o) => o.status === "delivered").length;
    return { ...a, deliveredThisWeek: delivered, totalThisWeek: ao.length };
  });
  const bestAgent = agentStats.sort((a, b) => b.deliveredThisWeek - a.deliveredThisWeek)[0];

  // Customers data
  const customerMap = new Map<string, { name: string; phone: string; orders: number; total: number }>();
  orders.forEach((o) => {
    const key = o.phone;
    const existing = customerMap.get(key);
    if (existing) {
      existing.orders++;
      existing.total += o.total;
    } else {
      customerMap.set(key, { name: o.customer, phone: o.phone, orders: 1, total: o.total });
    }
  });
  const customers = Array.from(customerMap.values()).sort((a, b) => b.total - a.total);

  // Revenue by city
  const cityRevenue = new Map<string, number>();
  orders.filter((o) => o.status === "delivered").forEach((o) => {
    const city = o.address.split("—")[0]?.trim() || o.address;
    cityRevenue.set(city, (cityRevenue.get(city) || 0) + o.total);
  });
  const topCities = Array.from(cityRevenue.entries()).sort((a, b) => b[1] - a[1]);

  const toggleOrderExpand = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const TABS = [
    { key: "dashboard", icon: "📊", label: "الرئيسية" },
    { key: "products", icon: "🏪", label: "المنتجات" },
    { key: "orders", icon: "📋", label: "الأوردرات", badge: pending },
    { key: "stock", icon: "📦", label: "الستوك", badge: lowStock.length + outOfStock.length },
    { key: "returns", icon: "↩️", label: "المرتجعات" },
    { key: "agents", icon: "🚴", label: "المناديب" },
    { key: "customers", icon: "👥", label: "العملاء" },
    { key: "coupons", icon: "🎟️", label: "الكوبونات" },
    { key: "reports", icon: "📈", label: "التقارير" },
    { key: "activity", icon: "📝", label: "سجل النشاط" },
  ];

  return (
    <div className="fade-up">
      {/* Tabs */}
      <div className="flex gap-2 mb-[26px] flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative border-[1.5px] cursor-pointer transition-all rounded-xl font-bold py-2.5 px-5 text-[13px] ${
              tab === t.key
                ? "bg-primary text-white border-primary shadow-[0_4px_16px_hsl(var(--primary)/0.3)]"
                : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-soft"
            }`}
          >
            {t.icon} {t.label}
            {t.badge && t.badge > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 rounded-full w-[18px] h-[18px] text-[9px] flex items-center justify-center font-black ${
                tab === t.key ? "bg-white/90 text-destructive" : "bg-destructive text-white"
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px] mb-7">
            {[
              { label: "إجمالي الإيرادات", value: `${revenue.toLocaleString()} د.إ`, icon: "💰", color: "text-success", bg: "bg-success-soft", sub: "من الطلبات المسلّمة" },
              { label: "إجمالي الأوردرات", value: orders.length, icon: "📋", color: "text-primary", bg: "bg-primary-soft", sub: `${pending} في الانتظار` },
              { label: "نسبة المرتجعات", value: `${retRate}%`, icon: "↩️", color: "text-destructive", bg: "bg-destructive-soft", sub: `${returns.length} مرتجع` },
              { label: "عدد المنتجات", value: products.length, icon: "📦", color: "text-purple", bg: "bg-purple-soft", sub: `${outOfStock.length} نفد مخزونه` },
            ].map((s, i) => (
              <div key={i} className="bg-card border-[1.5px] border-border rounded-xl p-[22px] flex justify-between items-start shadow-store">
                <div>
                  <div className="text-xs text-muted-foreground mb-[7px]">{s.label}</div>
                  <div className={`text-[26px] font-black ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                </div>
                <div className={`w-[50px] h-[50px] ${s.bg} rounded-[14px] flex items-center justify-center text-[22px]`}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* Orders timeline + Best agent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-[15px] font-extrabold text-foreground mb-4">📅 الطلبات</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "اليوم", v: ordersToday, c: "text-primary", bg: "bg-primary-soft" },
                  { l: "هذا الأسبوع", v: ordersWeek, c: "text-purple", bg: "bg-purple-soft" },
                  { l: "هذا الشهر", v: ordersMonth, c: "text-success", bg: "bg-success-soft" },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-xl p-4 text-center`}>
                    <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {bestAgent && (
              <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
                <div className="text-[15px] font-extrabold text-foreground mb-4">🏆 أفضل مندوب هذا الأسبوع</div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-warning to-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-store-md">🚴</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{bestAgent.name}</div>
                    <div className="text-xs text-muted-foreground">{bestAgent.zone}</div>
                    <div className="text-sm font-bold text-success mt-1">✅ {bestAgent.deliveredThisWeek} طلب مسلّم</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stock alerts */}
          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <div className="bg-warning-soft border-[1.5px] border-warning/30 rounded-[18px] p-5 mb-6">
              <div className="text-[15px] font-extrabold text-warning mb-3">⚠️ تنبيهات المخزون</div>
              <div className="flex flex-wrap gap-2">
                {outOfStock.map((p) => (
                  <span key={p.id} className="bg-card border-[1.5px] border-destructive text-destructive rounded-[10px] py-1 px-3.5 text-xs font-bold">🔴 {p.name} — نفد!</span>
                ))}
                {lowStock.map((p) => (
                  <span key={p.id} className="bg-card border-[1.5px] border-warning text-warning rounded-[10px] py-1 px-3.5 text-xs font-bold">🟡 {p.name} — متبقي {p.stock}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
            <div className="text-[15px] font-extrabold text-foreground mb-[18px]">📋 آخر الأوردرات</div>
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex justify-between items-center py-[13px] border-b border-border-light flex-wrap gap-2">
                <div className="flex gap-2.5 items-center">
                  <span className="font-extrabold text-primary text-[13px]">{o.id}</span>
                  <span className="text-muted-foreground text-[13px]">{o.customer}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-black text-primary">{o.total.toLocaleString()} <span className="text-[11px]">د.إ</span></span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {tab === "products" && <ProductManagement products={products} />}

      {/* ORDERS - Collapsible */}
      {tab === "orders" && orders.map((o) => (
        <Collapsible key={o.id} open={expandedOrders.has(o.id)} onOpenChange={() => toggleOrderExpand(o.id)}>
          <div className="bg-card border-[1.5px] border-border rounded-[18px] mb-3.5 shadow-store overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="p-5 cursor-pointer hover:bg-surface-alt/50 transition-colors">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex gap-3 items-center">
                    <span className="text-muted-foreground">{expandedOrders.has(o.id) ? "▼" : "▶"}</span>
                    <span className="font-black text-primary text-[15px]">{o.id}</span>
                    <span className="text-muted-foreground text-[13px]">{o.customer}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-muted-foreground">{o.created_at.slice(0, 10)}</span>
                    <span className="font-black text-primary text-[17px]">{o.total.toLocaleString()} <span className="text-xs">د.إ</span></span>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 pb-5 border-t border-border-light pt-4">
                <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                  {[
                    { l: "العميل", v: o.customer },
                    { l: "الموبايل", v: o.phone },
                    { l: "العنوان", v: o.address },
                    { l: "المندوب", v: o.agents?.name || "لم يُعيَّن" },
                    { l: "تاريخ الإنشاء", v: o.created_at.slice(0, 10) },
                    { l: "آخر تحديث", v: o.updated_at.slice(0, 10) },
                  ].map((f, i) => (
                    <div key={i} className="bg-surface-alt rounded-[10px] py-[9px] px-[13px] border-[1.5px] border-border">
                      <div className="text-[10px] text-muted-foreground mb-0.5">{f.l}</div>
                      <div className="text-xs text-foreground font-semibold">{f.v}</div>
                    </div>
                  ))}
                </div>

                {/* Order items */}
                <div className="mb-3.5">
                  {o.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between bg-surface-alt rounded-[10px] py-[9px] px-3.5 mb-1.5">
                      <span className="text-[13px] text-muted-foreground">· {item.product_name} × {item.qty}</span>
                      <span className="text-[13px] font-extrabold text-primary">{(item.price * item.qty).toLocaleString()} د.إ</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {o.status === "pending" && <ActionBtn label="📦 جاري التجهيز" colorClass="bg-primary" onClick={() => onUpdateStatus(o.id, "preparing")} />}
                  {o.status === "preparing" && <ActionBtn label="🚴 في الطريق" colorClass="bg-purple" onClick={() => onUpdateStatus(o.id, "on_way")} />}
                  {o.status === "on_way" && <ActionBtn label="✅ تم التسليم" colorClass="bg-success" onClick={() => onUpdateStatus(o.id, "delivered")} />}
                  {["on_way", "preparing"].includes(o.status) && <ActionBtn label="↩️ مرتجع" colorClass="bg-destructive" onClick={() => setReturnModal(o)} outline />}
                  
                  {/* Call + WhatsApp + Invoice */}
                  <a href={`tel:${o.phone}`} className="bg-success text-white border-none cursor-pointer transition-all duration-150 rounded-xl font-bold px-[18px] py-[9px] text-xs hover:-translate-y-0.5 inline-flex items-center gap-1">
                    📞 اتصال
                  </a>
                  <a href={`https://wa.me/${o.phone.replace(/\s+/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="bg-success text-white border-none cursor-pointer transition-all duration-150 rounded-xl font-bold px-[18px] py-[9px] text-xs hover:-translate-y-0.5 inline-flex items-center gap-1">
                    💬 واتساب
                  </a>
                  <button
                    onClick={() => {
                      const invoiceContent = `
فاتورة #${o.id}
العميل: ${o.customer}
الهاتف: ${o.phone}
العنوان: ${o.address}
التاريخ: ${o.created_at.slice(0, 10)}
─────────────────
${o.order_items.map((it) => `${it.product_name} × ${it.qty} = ${(it.price * it.qty).toLocaleString()} د.إ`).join("\n")}
─────────────────
الإجمالي: ${o.total.toLocaleString()} د.إ
الدفع: كاش عند الاستلام
                      `.trim();
                      const w = window.open("", "_blank");
                      if (w) {
                        w.document.write(`<pre dir="rtl" style="font-family:monospace;font-size:14px;padding:40px;white-space:pre-wrap">${invoiceContent}</pre>`);
                        w.document.title = `فاتورة ${o.id}`;
                        setTimeout(() => w.print(), 300);
                      }
                    }}
                    className="bg-card text-foreground border-[1.5px] border-border cursor-pointer transition-all duration-150 rounded-xl font-bold px-[18px] py-[9px] text-xs hover:-translate-y-0.5"
                  >
                    🖨️ طباعة الفاتورة
                  </button>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}

      {/* STOCK */}
      {tab === "stock" && (
        <div>
          <div className="flex justify-between mb-5">
            <div className="text-base font-extrabold text-foreground">📦 إدارة المخزون</div>
          </div>
          {products.map((p) => {
            const productMovements = movements.filter((m) => m.product_id === p.id).slice(0, 3);
            return (
              <div
                key={p.id}
                className={`bg-card border-[1.5px] rounded-2xl py-4 px-5 mb-3 shadow-store ${
                  p.stock === 0 ? "border-destructive" : p.stock <= p.min_stock ? "border-warning" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-[52px] h-[52px] bg-primary-soft rounded-[14px] flex items-center justify-center text-[28px]">{p.image}</div>
                  <div className="flex-1 min-w-[160px]">
                    <div className="font-extrabold text-foreground text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.price} د.إ</div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-[10px] text-muted-foreground mb-0.5">الستوك</div>
                    <div className={`text-[26px] font-black ${p.stock === 0 ? "text-destructive" : p.stock <= p.min_stock ? "text-warning" : "text-success"}`}>{p.stock}</div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-[10px] text-muted-foreground mb-0.5">الحد الأدنى</div>
                    <div className="text-base font-bold text-muted-foreground">{p.min_stock}</div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="±كمية"
                      value={stockEdit[p.id] || ""}
                      onChange={(e) => setStockEdit((v) => ({ ...v, [p.id]: e.target.value }))}
                      className="w-[90px] bg-surface-alt border-[1.5px] border-border rounded-xl py-2 px-3 text-foreground text-sm transition-colors focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        const v = parseInt(stockEdit[p.id]);
                        if (!v || isNaN(v)) return;
                        onUpdateStock(p.id, v);
                        setStockEdit((v2) => ({ ...v2, [p.id]: "" }));
                      }}
                      className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl py-[9px] px-[18px] text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5 shadow-store"
                    >
                      تحديث
                    </button>
                  </div>
                  {p.stock === 0 && <span className="bg-destructive-soft text-destructive border-[1.5px] border-destructive/30 rounded-[10px] py-1 px-3 text-[11px] font-extrabold">نفد!</span>}
                  {p.stock > 0 && p.stock <= p.min_stock && <span className="bg-warning-soft text-warning border-[1.5px] border-warning/30 rounded-[10px] py-1 px-3 text-[11px] font-extrabold">⚠️ مخزون منخفض</span>}
                </div>

                {/* Movement history */}
                {productMovements.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-light">
                    <div className="text-[10px] text-muted-foreground mb-2 font-bold">📋 آخر الحركات:</div>
                    <div className="flex flex-wrap gap-2">
                      {productMovements.map((m) => (
                        <span key={m.id} className={`text-[11px] font-bold rounded-lg py-0.5 px-2.5 ${
                          m.qty_change > 0 ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"
                        }`}>
                          {m.qty_change > 0 ? "+" : ""}{m.qty_change} {m.reason} · {m.created_at.slice(0, 10)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RETURNS */}
      {tab === "returns" && (
        <div>
          <div className="text-base font-extrabold text-foreground mb-5">↩️ سجل المرتجعات</div>
          {returns.length === 0 && (
            <div className="text-center text-muted-foreground py-[60px] bg-card rounded-xl border-[1.5px] border-border">لا توجد مرتجعات 🎉</div>
          )}
          {returns.map((r) => (
            <div key={r.id} className="bg-card border-[1.5px] border-destructive/20 rounded-2xl p-5 mb-3 flex justify-between items-center flex-wrap gap-3 shadow-store">
              <div>
                <div className="font-extrabold text-destructive mb-1.5">{r.id} ← {r.order_id}</div>
                <div className="text-foreground text-sm mb-1">{r.product_name} × {r.qty}</div>
                <div className="text-xs text-muted-foreground">السبب: <span className="text-warning font-bold">{r.reason}</span></div>
              </div>
              <div className="bg-surface-alt rounded-xl py-2.5 px-[18px] text-center border-[1.5px] border-border">
                <div className="text-[11px] text-muted-foreground">التاريخ</div>
                <div className="font-extrabold text-foreground">{r.created_at.slice(0, 10)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AGENTS */}
      {tab === "agents" && (
        <div>
          <div className="text-base font-extrabold text-foreground mb-5">🚴 إدارة المناديب</div>
          {agents.map((agent) => {
            const ao = orders.filter((o) => o.agent_id === agent.id);
            const delivered = ao.filter((o) => o.status === "delivered").length;
            const successRate = ao.length > 0 ? ((delivered / ao.length) * 100).toFixed(0) : "0";
            return (
              <div key={agent.id} className="bg-card border-[1.5px] border-border rounded-xl p-[22px] mb-[18px] shadow-store">
                <div className="flex justify-between flex-wrap gap-3 mb-[18px]">
                  <div className="flex gap-3.5 items-center">
                    <div className="w-[52px] h-[52px] bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl shadow-store-md">🚴</div>
                    <div>
                      <div className="font-extrabold text-foreground text-[15px]">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.phone} · {agent.zone}</div>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    {[
                      { l: "إجمالي", v: ao.length, c: "text-primary" },
                      { l: "مسلّم", v: delivered, c: "text-success" },
                      { l: "نسبة النجاح", v: `${successRate}%`, c: "text-warning" },
                      { l: "⭐ تقييم", v: ao.length > 0 ? (4.2 + delivered * 0.1).toFixed(1) : "—", c: "text-warning" },
                      { l: "مرتجع", v: ao.filter((o) => o.status === "returned").length, c: "text-destructive" },
                    ].map((s, i) => (
                      <div key={i} className="bg-surface-alt rounded-xl py-2.5 px-[18px] text-center border-[1.5px] border-border">
                        <div className={`text-[20px] font-black ${s.c}`}>{s.v}</div>
                        <div className="text-[11px] text-muted-foreground">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {ao.slice(0, 5).map((o) => (
                  <div key={o.id} className="bg-surface-alt rounded-xl py-2.5 px-4 mb-2 flex justify-between flex-wrap gap-2">
                    <div className="flex gap-2.5 items-center">
                      <span className="font-extrabold text-primary text-[13px]">{o.id}</span>
                      <span className="text-muted-foreground text-[13px]">{o.customer}</span>
                      <span className="text-muted-foreground text-xs">{o.address}</span>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* CUSTOMERS */}
      {tab === "customers" && (
        <div>
          <div className="text-base font-extrabold text-foreground mb-5">👥 العملاء — {customers.length} عميل</div>
          {customers.map((c, i) => (
            <div key={i} className="bg-card border-[1.5px] border-border rounded-xl p-5 mb-3 flex justify-between items-center flex-wrap gap-3 shadow-store">
              <div className="flex gap-3.5 items-center">
                <div className="w-11 h-11 bg-primary-soft rounded-full flex items-center justify-center text-lg font-black text-primary">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">{c.phone}</div>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <div className="text-lg font-black text-primary">{c.orders}</div>
                  <div className="text-[10px] text-muted-foreground">طلبات</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-success">{c.total.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">د.إ إجمالي</div>
                </div>
                <a href={`https://wa.me/${c.phone.replace(/\s+/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer"
                  className="bg-success text-white rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5">
                  💬 واتساب
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COUPONS */}
      {tab === "coupons" && (
        <div>
          <div className="text-base font-extrabold text-foreground mb-5">🎟️ كوبونات الخصم</div>
          
          {/* Add coupon form */}
          <div className="bg-card border-[1.5px] border-border rounded-xl p-5 mb-5 shadow-store">
            <div className="text-sm font-extrabold text-foreground mb-4">+ إضافة كوبون جديد</div>
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1 font-bold">الكود</label>
                <input value={newCoupon.code} onChange={(e) => setNewCoupon((v) => ({ ...v, code: e.target.value.toUpperCase() }))}
                  className="w-[130px] bg-surface-alt border-[1.5px] border-border rounded-xl py-2 px-3 text-foreground text-sm transition-colors focus:border-primary" placeholder="SAVE10" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1 font-bold">نسبة الخصم %</label>
                <input type="number" value={newCoupon.discount} onChange={(e) => setNewCoupon((v) => ({ ...v, discount: e.target.value }))}
                  className="w-[100px] bg-surface-alt border-[1.5px] border-border rounded-xl py-2 px-3 text-foreground text-sm transition-colors focus:border-primary" placeholder="10" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1 font-bold">الحد الأقصى</label>
                <input type="number" value={newCoupon.maxUses} onChange={(e) => setNewCoupon((v) => ({ ...v, maxUses: e.target.value }))}
                  className="w-[100px] bg-surface-alt border-[1.5px] border-border rounded-xl py-2 px-3 text-foreground text-sm transition-colors focus:border-primary" placeholder="100" />
              </div>
              <button onClick={() => {
                if (!newCoupon.code || !newCoupon.discount) return toast.error("أدخل الكود ونسبة الخصم");
                createCoupon.mutate({ code: newCoupon.code, discount_percent: parseInt(newCoupon.discount), max_uses: parseInt(newCoupon.maxUses) || 100 }, {
                  onSuccess: () => { toast.success("تم إضافة الكوبون ✓"); setNewCoupon({ code: "", discount: "", maxUses: "" }); },
                });
              }} className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl py-2 px-5 text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5 shadow-store">
                + إضافة
              </button>
            </div>
          </div>

          {coupons.map((c) => (
            <div key={c.id} className={`bg-card border-[1.5px] rounded-xl p-5 mb-3 flex justify-between items-center flex-wrap gap-3 shadow-store ${c.active ? "border-border" : "border-destructive/30 opacity-60"}`}>
              <div className="flex gap-3 items-center">
                <div className="text-2xl">🎟️</div>
                <div>
                  <div className="font-black text-primary text-lg" dir="ltr">{c.code}</div>
                  <div className="text-xs text-muted-foreground">خصم {c.discount_percent}% · استُخدم {c.used_count}/{c.max_uses}</div>
                </div>
              </div>
              <button onClick={() => toggleCoupon.mutate({ id: c.id, active: !c.active })}
                className={`rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all ${c.active ? "bg-destructive-soft text-destructive" : "bg-success-soft text-success"}`}>
                {c.active ? "تعطيل" : "تفعيل"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* REPORTS */}
      {tab === "reports" && (
        <div>
          <div className="text-base font-extrabold text-foreground mb-5">📈 التقارير والإحصائيات</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Order status distribution */}
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-sm font-extrabold text-foreground mb-[18px]">📊 توزيع حالات الأوردرات</div>
              {(Object.entries(STATUS_CFG) as [OrderStatus, typeof STATUS_CFG[OrderStatus]][]).map(([key, cfg]) => {
                const count = orders.filter((o) => o.status === key).length;
                const pct = orders.length ? ((count / orders.length) * 100).toFixed(0) : "0";
                const barColorMap: Record<string, string> = { warning: "bg-warning", primary: "bg-primary", purple: "bg-purple", success: "bg-success", destructive: "bg-destructive" };
                const textColorMap: Record<string, string> = { warning: "text-warning", primary: "text-primary", purple: "text-purple", success: "text-success", destructive: "text-destructive" };
                return (
                  <div key={key} className="mb-3.5">
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-[13px] ${textColorMap[cfg.color]} font-bold`}>{cfg.icon} {cfg.label}</span>
                      <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="bg-surface-alt rounded-full h-2">
                      <div className={`${barColorMap[cfg.color]} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%`, minWidth: Number(pct) > 0 ? "12px" : "0" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Best sellers */}
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-sm font-extrabold text-foreground mb-[18px]">🔥 أكثر المنتجات مبيعاً</div>
              {[...products].sort((a, b) => b.sales - a.sales).slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex justify-between items-center py-2.5 border-b border-border-light">
                  <div className="flex gap-2.5 items-center">
                    <span className={`text-base font-black ${i === 0 ? "text-warning" : "text-muted-foreground"}`}>#{i + 1}</span>
                    <span className="text-[26px]">{p.image}</span>
                    <span className="text-[13px] text-foreground font-semibold">{p.name.substring(0, 22)}…</span>
                  </div>
                  <span className="font-black text-primary text-[13px]">{p.sales}</span>
                </div>
              ))}
            </div>

            {/* Revenue / Profit */}
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-sm font-extrabold text-foreground mb-[18px]">💰 الأرباح</div>
              {[
                { l: "الإيرادات", v: `${revenue.toLocaleString()} د.إ`, c: "text-success" },
                { l: "المرتجعات", v: `${orders.filter((o) => o.status === "returned").reduce((s, o) => s + o.total, 0).toLocaleString()} د.إ`, c: "text-destructive" },
                { l: "صافي الربح", v: `${(revenue - orders.filter((o) => o.status === "returned").reduce((s, o) => s + o.total, 0)).toLocaleString()} د.إ`, c: "text-primary" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-border-light">
                  <span className="text-[13px] text-muted-foreground">{s.l}</span>
                  <span className={`font-black text-[15px] ${s.c}`}>{s.v}</span>
                </div>
              ))}
            </div>

            {/* Top cities */}
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-sm font-extrabold text-foreground mb-[18px]">🏙️ أكثر المدن طلباً</div>
              {topCities.length === 0 && <div className="text-muted-foreground text-[13px]">لا توجد بيانات</div>}
              {topCities.map(([city, total], i) => (
                <div key={city} className="flex justify-between py-[9px] border-b border-border-light">
                  <div className="flex gap-2 items-center">
                    <span className={`text-base font-black ${i === 0 ? "text-warning" : "text-muted-foreground"}`}>#{i + 1}</span>
                    <span className="text-[13px] text-foreground font-semibold">{city}</span>
                  </div>
                  <span className="font-black text-primary text-[13px]">{total.toLocaleString()} د.إ</span>
                </div>
              ))}
            </div>

            {/* Return reasons */}
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-sm font-extrabold text-foreground mb-[18px]">↩️ أسباب المرتجعات</div>
              {returns.length === 0 && <div className="text-muted-foreground text-[13px]">لا توجد مرتجعات 🎉</div>}
              {RETURN_REASONS.map((reason) => {
                const count = returns.filter((r) => r.reason === reason).length;
                return count > 0 ? (
                  <div key={reason} className="flex justify-between py-[9px] border-b border-border-light">
                    <span className="text-[13px] text-muted-foreground">{reason}</span>
                    <span className="font-extrabold text-destructive">{count}</span>
                  </div>
                ) : null;
              })}
            </div>

            {/* Avg delivery time */}
            <div className="bg-card border-[1.5px] border-border rounded-xl p-[22px] shadow-store">
              <div className="text-sm font-extrabold text-foreground mb-[18px]">⏱️ متوسط وقت التسليم</div>
              {(() => {
                const deliveredOrders = orders.filter((o) => o.status === "delivered");
                if (deliveredOrders.length === 0) return <div className="text-muted-foreground text-[13px]">لا توجد بيانات</div>;
                const avgDays = deliveredOrders.reduce((s, o) => {
                  const diff = (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 86400000;
                  return s + diff;
                }, 0) / deliveredOrders.length;
                return (
                  <div className="text-center py-6">
                    <div className="text-4xl font-black text-primary">{avgDays.toFixed(1)}</div>
                    <div className="text-muted-foreground text-sm mt-2">يوم في المتوسط</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY LOG */}
      {tab === "activity" && (
        <div>
          <div className="text-base font-extrabold text-foreground mb-5">📝 سجل النشاط</div>
          {activityLog.length === 0 && (
            <div className="text-center text-muted-foreground py-[60px] bg-card rounded-xl border-[1.5px] border-border">لا يوجد نشاط مسجّل بعد</div>
          )}
          {activityLog.map((entry) => (
            <div key={entry.id} className="bg-card border-[1.5px] border-border rounded-xl p-4 mb-2 flex justify-between items-center flex-wrap gap-2 shadow-store">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 bg-primary-soft rounded-full flex items-center justify-center text-sm">📝</div>
                <div>
                  <div className="text-sm font-bold text-foreground">{entry.action}</div>
                  <div className="text-xs text-muted-foreground">{entry.details}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.actor} · {new Date(entry.created_at).toLocaleString("ar-AE")}
              </div>
            </div>
          ))}
        </div>
      )}

      {returnModal && (
        <ReturnModal
          order={returnModal}
          onConfirm={(reason) => {
            const firstItem = returnModal.order_items[0];
            onAddReturn(returnModal.id, firstItem?.product_name || "", reason, 1);
            setReturnModal(null);
          }}
          onClose={() => setReturnModal(null)}
        />
      )}
    </div>
  );
}
