import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Return {
  id: string;
  order_id: string;
  product_name: string;
  reason: string;
  qty: number;
  created_at: string;
}

export function useReturns() {
  return useQuery({
    queryKey: ["returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("returns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Return[];
    },
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ret: {
      order_id: string;
      product_name: string;
      reason: string;
      qty: number;
    }) => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/process-return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: ret.order_id,
            productName: ret.product_name,
            reason: ret.reason,
            qty: ret.qty,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to process return");
      }
      const data = await res.json();
      return data.returnId as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["inventory_movements"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });
}
