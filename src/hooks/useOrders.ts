import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderStatus } from "@/lib/constants";

export interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  total: number;
  status: OrderStatus;
  agent_id: number | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  agents: { id: number; name: string; phone: string; zone: string } | null;
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), agents(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/update-order-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, status }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["inventory_movements"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: {
      customer: string;
      phone: string;
      address: string;
      total: number;
      items: { product_id: number; product_name: string; qty: number; price: number }[];
    }) => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }
      const data = await res.json();
      return data.orderId as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });
}
