"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Store {
  id: string;
  user_id: string;
  name: string;
  shopify_domain: string | null;
  shopify_access_token: string | null;
  sending_domain: string | null;
  resend_domain_id: string | null;
  domain_verified: boolean;
  sender_name: string | null;
  sender_email: string | null;
  reply_to: string | null;
  webhook_secret: string | null;
  created_at: string;
}

export function useStore() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setStore(data);
      setLoading(false);
    }

    fetchStore();
  }, []);

  return { store, loading };
}
