import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Agent {
  id: number;
  name: string;
  phone: string;
  zone: string;
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("id");
      if (error) throw error;
      return data as Agent[];
    },
  });
}
