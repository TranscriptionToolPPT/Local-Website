import { useState } from "react";
import { StatusBadge, ActionBtn } from "./SharedComponents";
import { ReturnModal } from "./ReturnModal";
import type { OrderStatus } from "@/lib/constants";
import type { Order } from "@/hooks/useOrders";
import type { Agent } from "@/hooks/useAgents";

interface DeliveryViewProps {
  orders: Order[];
  agents: Agent[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onAddReturn: (orderId: string, productName: string, reason: string, qty: number) => void;
}

export function DeliveryView({ orders, agents, onUpdateStatus, onAddReturn }: DeliveryViewProps) {
  const [agentId, setAgentId] = useState(agents[0]?.id || 1);
  const [returnModal, setReturnModal] = useState<Order | null>(null);
  const agent = agents.find((a) => a.id === agentId);
  const agentOrders = orders.filter((o) => o.agent_id === agentId);
  const delivered = agentOrders.filter((o) => o.status === "delivered").length;
  const onWay = agentOrders.filter((o) => o.status === "on_way").length;
  const successRate = agentOrders.length > 0 ? ((delivered / agentOrders.length) * 100).toFixed(0) : "0";

  return (
    <div className="fade-up space-y-6">
      {/* Agent selector pills */}
      <div className="flex gap-3 flex-wrap">
        {agents.map((a) => (
          <button
            key={a.id}
            onClick={() => setAgentId(a.id)}
            className={`cursor-pointer transition-all rounded-full font-bold py-3 px-7 text-sm flex items-center gap-2 ${
              agentId === a.id
                ? "bg-primary text-primary-foreground shadow-store-md"
                : "bg-card border border-card-foreground/10 text-card-foreground hover:border-primary/40 shadow-store-card"
            }`}
          >
            <span className="text-lg">🚴</span> {a.name}
          </button>
        ))}
      </div>

      {/* Agent profile card */}
      {agent && (
        <div className="relative rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, hsl(174 62% 35%) 0%, hsl(220 40% 35%) 50%, hsl(222 35% 25%) 100%)'
        }}>
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
          
          <div className="relative z-10 p-6 flex justify-between items-center flex-wrap gap-5">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                🚴
              </div>
              <div>
                <div className="font-black text-white text-xl">{agent.name}</div>
                <div className="text-sm text-white/60 mt-0.5">{agent.phone} · {agent.zone}</div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {[
                { l: "أوردراتي", v: agentOrders.length, color: "text-white" },
                { l: "مسلّم", v: delivered, color: "text-emerald-300" },
                { l: "في الطريق", v: onWay, color: "text-sky-300" },
                { l: "نسبة النجاح", v: `${successRate}%`, color: "text-amber-300" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl py-3 px-5 text-center min-w-[80px] border border-white/5">
                  <div className={`text-2xl font-black ${s.color}`}>{s.v}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {agentOrders.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-card-foreground/10 shadow-store-card">
          <div className="text-5xl mb-4">📭</div>
          <div className="text-card-foreground/60 font-bold">لا توجد أوردرات معينة لك</div>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-4">
        {agentOrders.map((o) => (
          <div key={o.id} className="bg-card rounded-2xl border border-card-foreground/10 overflow-hidden shadow-store-card transition-all hover:shadow-store-md">
            {/* Order header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-card-foreground/5">
              <div className="flex gap-3 items-center">
                <span className="font-black text-primary text-base">{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <span className="font-black text-primary text-lg">{o.total.toLocaleString()} <span className="text-xs font-bold">د.إ</span></span>
            </div>

            {/* Order details */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  { i: "👤", l: "العميل", v: o.customer },
                  { i: "📞", l: "الموبايل", v: o.phone },
                  { i: "📍", l: "العنوان", v: o.address },
                  { i: "💵", l: "المبلغ", v: `${o.total.toLocaleString()} د.إ كاش` },
                ].map((f, idx) => (
                  <div key={idx} className="bg-surface-alt rounded-xl py-3 px-4 border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                      <span>{f.i}</span> {f.l}
                    </div>
                    <div className="text-sm font-bold text-foreground">{f.v}</div>
                  </div>
                ))}
              </div>

              {/* Order items */}
              <div className="mb-4 space-y-1.5">
                {o.order_items.map((p) => (
                  <div key={p.id} className="flex justify-between bg-surface-alt rounded-xl py-2.5 px-4 border border-border">
                    <span className="text-sm text-muted-foreground">· {p.product_name} × {p.qty}</span>
                    <span className="text-sm font-extrabold text-primary">{(p.price * p.qty).toLocaleString()} د.إ</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 flex-wrap items-center">
                {o.status === "preparing" && (
                  <button
                    onClick={() => onUpdateStatus(o.id, "on_way")}
                    className="bg-secondary text-secondary-foreground rounded-full py-2.5 px-6 text-xs font-bold cursor-pointer transition-all hover:brightness-110 shadow-store"
                  >
                    🚴 خرجت بالأوردر
                  </button>
                )}
                {o.status === "on_way" && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(o.id, "delivered")}
                      className="bg-success text-success-foreground rounded-full py-2.5 px-6 text-xs font-bold cursor-pointer transition-all hover:brightness-110 shadow-store"
                    >
                      ✅ تم التسليم
                    </button>
                    <button
                      onClick={() => setReturnModal(o)}
                      className="bg-transparent border border-destructive text-destructive rounded-full py-2.5 px-6 text-xs font-bold cursor-pointer transition-all hover:bg-destructive hover:text-destructive-foreground"
                    >
                      ↩️ مرتجع
                    </button>
                  </>
                )}
                {(o.status === "delivered" || o.status === "returned") && (
                  <div className={`rounded-full py-2.5 px-6 text-xs font-extrabold border ${
                    o.status === "delivered"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}>
                    {o.status === "delivered" ? "✅ تم التسليم بنجاح" : "↩️ تم تسجيل المرتجع"}
                  </div>
                )}
                
                <a href={`tel:${o.phone}`} className="bg-success text-success-foreground rounded-full py-2.5 px-5 text-xs font-bold cursor-pointer transition-all hover:brightness-110 shadow-store inline-flex items-center gap-1.5">
                  📞 اتصال
                </a>
                <a href={`https://wa.me/${o.phone.replace(/\s+/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="bg-success text-success-foreground rounded-full py-2.5 px-5 text-xs font-bold cursor-pointer transition-all hover:brightness-110 shadow-store inline-flex items-center gap-1.5">
                  💬 واتساب
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

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
