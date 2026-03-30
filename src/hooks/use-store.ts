"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Store } from "@/types/database"

export function useStore() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchStore() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Try to find existing store
        const { data } = await supabase
          .from("stores")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle()

        if (data) {
          setStore(data as Store)
          setLoading(false)
          return
        }

        // No store found - auto-create one via API (service role bypasses RLS)
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Minha Loja"
        const res = await fetch("/api/auth/setup-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            storeName: fullName,
            email: user.email,
          }),
        })

        if (res.ok) {
          const result = await res.json()
          if (result.store?.id) {
            // Re-fetch the full store object
            const { data: newStore } = await supabase
              .from("stores")
              .select("*")
              .eq("id", result.store.id)
              .single()

            setStore(newStore as Store | null)
          }
        }
      } catch (err) {
        console.error("Failed to load store:", err)
        setStore(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [])

  return { store, loading, storeLoading: loading }
}
