import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const typeIcon: Record<string, string> = {
    new_order: "🛒",
    return: "↩️",
    low_stock: "⚠️",
  };

  const typeBg: Record<string, string> = {
    new_order: "bg-primary-soft",
    return: "bg-destructive-soft",
    low_stock: "bg-warning-soft",
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative w-10 h-10 bg-surface-alt border border-border rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all hover:border-primary"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 w-[340px] bg-card border border-border rounded-2xl shadow-store-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <span className="font-bold text-foreground text-sm">🔔 الإشعارات</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary font-bold cursor-pointer">
                  تعليم الكل كمقروء
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  لا توجد إشعارات
                </div>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 border-b border-border-light transition-colors ${!n.read ? "bg-primary-soft/50" : ""}`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`w-9 h-9 ${typeBg[n.type] || "bg-muted"} rounded-xl flex items-center justify-center text-base shrink-0`}>
                      {typeIcon[n.type] || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString("ar-AE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
