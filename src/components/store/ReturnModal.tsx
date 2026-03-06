import { useState } from "react";
import { RETURN_REASONS } from "@/lib/constants";
import type { Order } from "@/hooks/useOrders";
import { toast } from "sonner";

interface ReturnModalProps {
  order: Order;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function ReturnModal({ order, onConfirm, onClose }: ReturnModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-foreground/40 z-[200] flex items-center justify-center p-5 backdrop-blur-[10px]">
      <div className="bg-card rounded-3xl w-full max-w-[440px] p-[30px] scale-in shadow-store-lg">
        <div className="text-4xl mb-2.5 text-center">↩️</div>
        <div className="text-[17px] font-black text-foreground mb-1.5 text-center">تسجيل مرتجع</div>
        <div className="text-muted-foreground text-[13px] mb-5 text-center">
          أوردر: <span className="text-primary font-bold">{order.id}</span> · {order.customer}
        </div>

        <div className="mb-5">
          <label className="text-xs text-muted-foreground block mb-1.5 font-bold">سبب المرتجع *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-card border-[1.5px] border-border rounded-xl py-[11px] px-4 text-foreground text-sm transition-colors focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
          >
            <option value="">اختر السبب...</option>
            {RETURN_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => {
              if (!reason) {
                toast.error("يرجى اختيار سبب المرتجع");
                return;
              }
              onConfirm(reason);
            }}
            className="flex-1 bg-gradient-to-r from-destructive to-red-600 text-white rounded-xl py-3 text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5 shadow-store-md"
          >
            تأكيد المرتجع
          </button>
          <button
            onClick={onClose}
            className="bg-surface-alt text-muted-foreground py-3 px-5 border-[1.5px] border-border rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
