"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Filter, Trash2 } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Segment } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function SegmentsPage() {
  const { store } = useStore()
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!store?.id) return

    async function fetchSegments() {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("segments")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false })

      if (!error && data) setSegments(data as Segment[])
      setLoading(false)
    }

    fetchSegments()
  }, [store?.id])

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("segments").delete().eq("id", id)
    if (error) {
      toast.error("Erro ao excluir segmento")
    } else {
      toast.success("Segmento excluído")
      setSegments(segments.filter((s) => s.id !== id))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Segmentos</h1>
        <Link
          href="/audience/segments/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Novo Segmento
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      ) : segments.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contatos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Criado em</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {segments.map((segment) => (
                <tr key={segment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{segment.name}</td>
                  <td className="px-4 py-3 text-gray-700">{segment.contact_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDistanceToNow(new Date(segment.created_at), { addSuffix: true, locale: ptBR })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(segment.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Filter size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">Nenhum segmento criado</h2>
            <p className="text-sm text-gray-500 mb-6">Segmente seus contatos para campanhas direcionadas.</p>
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
