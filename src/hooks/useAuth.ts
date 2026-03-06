import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "manager" | "delivery";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let role: AppRole | null = null;

        if (user) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            const { data } = await supabase.rpc("get_user_role", { _user_id: user.id });
            role = (data as AppRole) || null;
            setState({ user, session, role, loading: false });
          }, 0);
        }

        setState(prev => ({ ...prev, user, session, loading: !user ? false : prev.loading }));
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let role: AppRole | null = null;

      if (user) {
        const { data } = await supabase.rpc("get_user_role", { _user_id: user.id });
        role = (data as AppRole) || null;
      }

      setState({ user, session, role, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, role: null, loading: false });
  };

  return { ...state, signUp, signIn, signOut };
}
