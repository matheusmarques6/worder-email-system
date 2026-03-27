"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, ListFilter } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Segment } from "@/types"

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const { store } = useStore()

  useEffect(() => {
    if (!store?.id) return

    const supabase = createClient()

    async function fetchSegments() {
      setLoading(true)
      const { data, error } = await supabase
        .from("segments")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setSegments(data as Segment[])
      }
      setLoading(false)
    }

    fetchSegments()
  }, [store?.id])

  function rulesLabel(rules: Record<string, unknown> | null): string {
    if (!rules) return "—"
    const conditions = rules.conditions
    if (Array.isArray(conditions)) {
      return `${conditions.length} regra${conditions.length !== 1 ? "s" : ""}`
    }
    return "—"
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-gray-900">Segmentos</h1>
        </div>
        <Link
          href="/audience/segments/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Novo Segmento
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/5" />
            </div>
          ))}
        </div>
      ) : segments.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Contatos</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Regras</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Criado em</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr key={segment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 font-medium">{segment.name}</td>
                  <td className="px-6 py-3 text-gray-700">{segment.contact_count}</td>
                  <td className="px-6 py-3 text-gray-700">{rulesLabel(segment.rules)}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {format(new Date(segment.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/audience/segments/${segment.id}`}
                      className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <ListFilter size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhum segmento criado
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Crie segmentos para agrupar seus contatos
            </p>
            <Link
              href="/audience/segments/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Novo Segmento
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
