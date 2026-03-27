"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, FileText, Pencil, Copy, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface TemplateRow {
  id: string
  name: string
  type: "email" | "whatsapp"
  html: string | null
  created_at: string
  updated_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const { store } = useStore()

  const fetchTemplates = useCallback(async () => {
    if (!store?.id) return

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, type, html, created_at, updated_at")
      .eq("store_id", store.id)
      .order("updated_at", { ascending: false })

    if (!error && data) {
      setTemplates(
        data.map((t) => ({
          id: t.id as string,
          name: t.name as string,
          type: t.type as "email" | "whatsapp",
          html: (t.html as string) ?? null,
          created_at: t.created_at as string,
          updated_at: t.updated_at as string,
        }))
      )
    }
    setLoading(false)
  }, [store?.id])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleDuplicate = useCallback(
    async (id: string) => {
      if (!store?.id) return

      const template = templates.find((t) => t.id === id)
      if (!template) return

      const supabase = createClient()
      const { data: original } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .eq("store_id", store.id)
        .single()

      if (!original) return

      const { error } = await supabase.from("templates").insert({
        store_id: store.id,
        name: `${original.name} (cópia)`,
        type: original.type,
        html: original.html,
        design_json: original.design_json,
      })

      if (!error) {
        toast({ title: "Template duplicado com sucesso" })
        fetchTemplates()
      } else {
        toast({ title: "Erro ao duplicar template", variant: "destructive" })
      }
    },
    [store?.id, templates, fetchTemplates]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!store?.id) return

      const supabase = createClient()
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id)
        .eq("store_id", store.id)

      if (!error) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
        toast({ title: "Template excluído" })
      } else {
        toast({ title: "Erro ao excluir template", variant: "destructive" })
      }
    },
    [store?.id]
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Templates</h1>
        <Link
          href="/templates/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Novo Template
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden group"
            >
              {/* Preview area */}
              <div className="h-40 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                {template.html ? (
                  <iframe
                    srcDoc={template.html}
                    className="w-full h-full pointer-events-none"
                    title={template.name}
                    sandbox=""
                  />
                ) : (
                  <FileText size={48} className="text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 truncate mb-2">
                  {template.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      template.type === "email"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {template.type === "email" ? "Email" : "WhatsApp"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(template.updated_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/templates/${template.id}/edit`}
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={14} />
                    Duplicar
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhum template criado
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Crie templates para usar em campanhas e automações
            </p>
            <Link
              href="/templates/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Novo Template
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
