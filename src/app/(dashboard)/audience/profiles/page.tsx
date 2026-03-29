"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Users, MailCheck, MailX } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { ImportCSV } from "@/components/contacts/import-csv"
import type { Contact } from "@/types/database"

interface ContactWithStats extends Contact {
  total_spent?: number
  total_orders?: number
  tags?: string[]
  city?: string | null
  state?: string | null
  country?: string | null
  consent_email?: string
  consent_whatsapp?: string
  properties?: Record<string, unknown>
}

const PAGE_SIZE = 20

export default function ProfilesPage() {
  return (
    <Suspense fallback={<ProfilesSkeleton />}>
      <ProfilesContent />
    </Suspense>
  )
}

function ProfilesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

function ProfilesContent() {
  const searchParams = useSearchParams()
  const { store, loading: storeLoading } = useStore()

  const page = Number(searchParams.get("page") || "1")
  const search = searchParams.get("search") || ""
  const filter = searchParams.get("filter") || ""

  const [contacts, setContacts] = useState<ContactWithStats[]>([])
  const [total, setTotal] = useState(0)
  const [subscribedCount, setSubscribedCount] = useState(0)
  const [unsubscribedCount, setUnsubscribedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    if (!store) return

    setLoading(true)
    const supabase = createClient()
    const offset = (page - 1) * PAGE_SIZE

    let query = supabase
      .from("contacts")
      .select("*", { count: "exact" })
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    if (filter === "subscribed") {
      query = query.eq("subscribed", true)
    } else if (filter === "unsubscribed") {
      query = query.eq("subscribed", false)
    }

    const { data, count } = await query

    setContacts((data as ContactWithStats[]) ?? [])
    setTotal(count ?? 0)

    // Fetch KPI counts
    const [subRes, unsubRes] = await Promise.all([
      supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("subscribed", true),
      supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("subscribed", false),
    ])

    setSubscribedCount(subRes.count ?? 0)
    setUnsubscribedCount(unsubRes.count ?? 0)
    setLoading(false)
  }, [store, page, search, filter])

  useEffect(() => {
    if (store) {
      fetchContacts()
    }
  }, [store, fetchContacts])

  if (storeLoading) {
    return <ProfilesSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contatos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0
              ? `${total} contato${total !== 1 ? "s" : ""} no total`
              : "Gerencie seus contatos"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {store && (
            <ImportCSV storeId={store.id} onComplete={fetchContacts} />
          )}
          <Button variant="ghost">
            <Download size={18} />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Contatos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : total.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <MailCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inscritos Email</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : subscribedCount.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <MailX size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Desinscritos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : unsubscribedCount.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 max-w-sm flex-1" />
            <Skeleton className="h-10 w-[160px]" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <ContactsTable
          contacts={contacts}
          total={total}
          page={page}
          search={search}
          filter={filter}
        />
      )}
    </div>
  )
}
