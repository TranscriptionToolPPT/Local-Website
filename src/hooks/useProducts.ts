import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  image: string;
  video: boolean;
  description: string | null;
  sales: number;
  rating: number;
  rating_count: number;
  views: number;
  badge: string | null;
}

export type ProductInsert = {
  name: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  image: string;
  video: boolean;
  description: string | null;
  badge: string | null;
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id");
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newStock }: { id: number; newStock: number }) => {
      const { error } = await supabase
        .from("products")
        .update({ stock: Math.max(0, newStock) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { error } = await supabase.from("products").insert(product);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: number }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
