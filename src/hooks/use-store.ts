"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Store } from "@/types/database"

export function useStore() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStore() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setStore(data as Store | null)
      setLoading(false)
    }

    fetchStore()
  }, [])

  return { store, loading }
}
