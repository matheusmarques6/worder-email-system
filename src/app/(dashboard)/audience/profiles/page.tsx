"use client"

import { useState, useEffect, useMemo } from "react"
import { Users, Search } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Contact } from "@/types"

export default function ProfilesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { store } = useStore()

  useEffect(() => {
    if (!store?.id) return

    const supabase = createClient()

    async function fetchContacts() {
      setLoading(true)
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setContacts(data as Contact[])
      }
      setLoading(false)
    }

    fetchContacts()
  }, [store?.id])

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.toLowerCase()
    return contacts.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        (c.first_name && c.first_name.toLowerCase().includes(q)) ||
        (c.last_name && c.last_name.toLowerCase().includes(q))
    )
  }, [contacts, search])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-[24px] font-semibold text-gray-900">Perfis</h1>
        <p className="text-sm text-gray-500">Gerencie seus contatos</p>
      </div>

      {/* Search */}
      <div className="relative mt-6 mb-6 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/8" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Telefone</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">
                    {[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{contact.email}</td>
                  <td className="px-6 py-3 text-gray-700">{contact.phone || "—"}</td>
                  <td className="px-6 py-3">
                    {contact.subscribed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                        Subscribed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Unsubscribed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {format(new Date(contact.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhum contato encontrado
            </h2>
            <p className="text-sm text-gray-500">
              Importe contatos ou conecte sua loja Shopify
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
