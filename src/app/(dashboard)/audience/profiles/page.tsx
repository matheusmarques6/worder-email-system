"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Search, Upload } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Contact } from "@/types"

export default function ProfilesPage() {
  const { store } = useStore()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!store?.id) return

    async function fetchContacts() {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false })
        .limit(100)

      if (!error && data) {
        setContacts(data as Contact[])
      }
      setLoading(false)
    }

    fetchContacts()
  }, [store?.id])

  const filtered = search
    ? contacts.filter(
        (c) =>
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          (c.first_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.last_name ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : contacts

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Perfis</h1>
        <button className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          <Upload size={18} />
          Importar Contatos
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Telefone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/audience/profiles/${contact.id}`} className="text-brand-600 hover:text-brand-700 font-medium">
                      {contact.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{contact.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      contact.subscribed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {contact.subscribed ? "Inscrito" : "Descadastrado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: ptBR })}
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
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">Nenhum contato encontrado</h2>
            <p className="text-sm text-gray-500 mb-6">Importe contatos ou conecte sua loja Shopify.</p>
            <button className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              <Upload size={18} />
              Importar Contatos
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
