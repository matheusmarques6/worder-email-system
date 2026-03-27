"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Template } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function TemplatesPage() {
  const { store } = useStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    if (!store?.id) return

    async function fetchTemplates() {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("store_id", store!.id)
        .order("updated_at", { ascending: false })

      if (!error && data) {
        setTemplates(data as Template[])
      }
      setLoading(false)
    }

    fetchTemplates()
  }, [store?.id])

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Erro ao excluir template")
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast.success("Template excluído com sucesso")
    }
    setOpenMenu(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus templates de email
          </p>
        </div>
        <Link
          href="/templates/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Criar Template
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/5" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atualizado
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/templates/${template.id}/edit`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        template.type === "email"
                          ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                          : "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700"
                      }
                    >
                      {template.type === "email" ? "Email" : "WhatsApp"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {template.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDistanceToNow(new Date(template.updated_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === template.id ? null : template.id
                          )
                        }
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openMenu === template.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-sm z-10">
                          <Link
                            href={`/templates/${template.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpenMenu(null)}
                          >
                            <Pencil size={14} />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhum template criado
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Crie seu primeiro template de email
            </p>
            <Link
              href="/templates/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Criar Template
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
