"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Zap } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Flow } from "@/types"

interface FlowRow extends Flow {
  entries_count: number
  emails_sent: number
}

const statusConfig: Record<Flow["status"], { label: string; className: string }> = {
  live: { label: "Live", className: "bg-green-50 text-green-700" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-700" },
}

const triggerLabels: Record<string, string> = {
  abandoned_cart: "Carrinho abandonado",
  welcome: "Boas-vindas",
  post_purchase: "Pós-compra",
  browse_abandonment: "Navegação abandonada",
  winback: "Reativação",
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<FlowRow[]>([])
  const [loading, setLoading] = useState(true)
  const { store } = useStore()

  useEffect(() => {
    if (!store?.id) return

    const supabase = createClient()

    async function fetchFlows() {
      setLoading(true)
      const { data, error } = await supabase
        .from("flows")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const rows: FlowRow[] = (data as Flow[]).map((f) => ({
          ...f,
          entries_count: 0,
          emails_sent: 0,
        }))
        setFlows(rows)
      }
      setLoading(false)
    }

    fetchFlows()
  }, [store?.id])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Automações</h1>
        <Link
          href="/flows/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Nova Automação
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/8" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/5" />
            </div>
          ))}
        </div>
      ) : flows.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Trigger</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Entradas</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Emails Enviados</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((flow) => {
                const badge = statusConfig[flow.status]
                return (
                  <tr key={flow.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/flows/${flow.id}`}
                        className="text-gray-900 font-medium hover:text-brand-600"
                      >
                        {flow.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {triggerLabels[flow.trigger_type] || flow.trigger_type}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{flow.entries_count}</td>
                    <td className="px-6 py-3 text-gray-700">{flow.emails_sent}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {format(new Date(flow.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Zap size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhuma automação criada
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Crie automações para engajar contatos automaticamente
            </p>
            <Link
              href="/flows/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Nova Automação
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
