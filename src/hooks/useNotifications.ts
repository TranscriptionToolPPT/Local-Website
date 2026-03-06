import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const qc = useQueryClient();
  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

  const { data: dbNotifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Notification[];
    },
  });

  useEffect(() => {
    // Listen for new orders
    const ordersChannel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const order = payload.new as any;
        const notif: Notification = {
          id: crypto.randomUUID(),
          type: "new_order",
          title: "🛒 طلب جديد",
          message: `طلب جديد #${order.id} — ${order.customer} — ${order.total} د.إ`,
          read: false,
          created_at: new Date().toISOString(),
        };
        setRealtimeNotifications(prev => [notif, ...prev]);
        // Save to DB
        supabase.from("notifications").insert({
          type: notif.type,
          title: notif.title,
          message: notif.message,
        }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
      })
      .subscribe();

    // Listen for returns
    const returnsChannel = supabase
      .channel("returns-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "returns" }, (payload) => {
        const ret = payload.new as any;
        const notif: Notification = {
          id: crypto.randomUUID(),
          type: "return",
          title: "↩️ مرتجع جديد",
          message: `مرتجع #${ret.id} — ${ret.product_name} — السبب: ${ret.reason}`,
          read: false,
          created_at: new Date().toISOString(),
        };
        setRealtimeNotifications(prev => [notif, ...prev]);
        supabase.from("notifications").insert({
          type: notif.type,
          title: notif.title,
          message: notif.message,
        }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
      })
      .subscribe();

    // Listen for low stock
    const productsChannel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, (payload) => {
        const product = payload.new as any;
        if (product.stock > 0 && product.stock <= product.min_stock) {
          const notif: Notification = {
            id: crypto.randomUUID(),
            type: "low_stock",
            title: "⚠️ مخزون منخفض",
            message: `${product.name} — متبقي ${product.stock} قطعة فقط`,
            read: false,
            created_at: new Date().toISOString(),
          };
          setRealtimeNotifications(prev => [notif, ...prev]);
          supabase.from("notifications").insert({
            type: notif.type,
            title: notif.title,
            message: notif.message,
          }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(returnsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [qc]);

  const allNotifications = [...realtimeNotifications, ...dbNotifications]
    .filter((n, i, arr) => arr.findIndex(x => x.id === n.id) === i)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setRealtimeNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return { notifications: allNotifications, unreadCount, markAllRead };
}
