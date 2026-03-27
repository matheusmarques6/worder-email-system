"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Calendar, ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ContactDetail {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  subscribed: boolean
  total_orders: number | null
  total_spent: number | null
  created_at: string
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contact, setContact] = useState<ContactDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContact() {
      const supabase = createClient()
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single()

      if (data) setContact(data as ContactDetail)
      setLoading(false)
    }
    fetchContact()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <p className="text-gray-500">Contato não encontrado.</p>
      </div>
    )
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Sem nome"

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Link href="/audience/profiles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Voltar para Perfis
      </Link>

      <h1 className="text-[24px] font-semibold text-gray-900 mb-6">{fullName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Informações</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">{contact.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">{contact.phone ?? "Não informado"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                Cadastrado {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                contact.subscribed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {contact.subscribed ? "Inscrito" : "Descadastrado"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Métricas</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                {contact.total_orders ?? 0} pedidos
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Total gasto: R$ {(contact.total_spent ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
