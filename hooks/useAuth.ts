import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Proveri da li vec postoji aktivna sesija (korisnik je ranije bio ulogovan)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Slusaj promene stanja prijave (login, logout, refresh tokena...)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading, isLoggedIn: !!session };
}
