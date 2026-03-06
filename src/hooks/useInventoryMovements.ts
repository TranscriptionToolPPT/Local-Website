import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryMovement {
  id: string;
  product_id: number;
  qty_change: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

export function useInventoryMovements() {
  return useQuery({
    queryKey: ["inventory_movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as InventoryMovement[];
    },
  });
}
