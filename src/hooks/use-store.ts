"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Store } from "@/types";

export function useStore() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStore() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setError("Usuário não autenticado");
        return;
      }

      const { data, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (storeError) {
        setError(storeError.message);
      } else {
        setStore(data as Store);
      }

      setLoading(false);
    }

    fetchStore();
  }, []);

  return { store, loading, error };
}
