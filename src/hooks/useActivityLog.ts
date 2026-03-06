import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityEntry {
  id: string;
  action: string;
  details: string;
  actor: string;
  created_at: string;
}

export function useActivityLog() {
  return useQuery({
    queryKey: ["activity_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as ActivityEntry[];
    },
  });
}
