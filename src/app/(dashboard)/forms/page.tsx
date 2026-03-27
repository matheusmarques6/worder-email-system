"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, ClipboardList, Pencil, BarChart3, Trash2 } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"

interface FormRow {
  id: string
  name: string
  type: "popup" | "embedded" | "landing" | "flyout"
  status: "active" | "inactive"
  impressions: number
  submissions: number
  created_at: string
}

const typeLabels: Record<FormRow["type"], string> = {
  popup: "Popup",
  embedded: "Incorporado",
  landing: "Landing Page",
  flyout: "Flyout",
}

const typeBadgeStyles: Record<FormRow["type"], string> = {
  popup: "bg-brand-50 text-brand-700",
  embedded: "bg-blue-50 text-blue-700",
  landing: "bg-emerald-50 text-emerald-700",
  flyout: "bg-amber-50 text-amber-700",
}

const statusLabels: Record<FormRow["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
}

const statusBadgeStyles: Record<FormRow["status"], string> = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  inactive: "bg-gray-100 text-gray-600 border border-gray-200",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function conversionRate(impressions: number, submissions: number): string {
  if (impressions === 0) return "0.0%"
  return ((submissions / impressions) * 100).toFixed(1) + "%"
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormRow[]>([])
  const [loading, setLoading] = useState(true)
  const { store } = useStore()

  useEffect(() => {
    if (!store?.id) return

    const supabase = createClient()

    async function fetchForms() {
      setLoading(true)
      const { data, error } = await supabase
        .from("forms")
        .select("id, name, type, status, impressions, submissions, created_at")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const rows: FormRow[] = data.map((f) => ({
          id: f.id as string,
          name: f.name as string,
          type: f.type as FormRow["type"],
          status: f.status as FormRow["status"],
          impressions: (f.impressions as number) ?? 0,
          submissions: (f.submissions as number) ?? 0,
          created_at: f.created_at as string,
        }))
        setForms(rows)
      }
      setLoading(false)
    }

    fetchForms()
  }, [store?.id])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!store?.id) return
      const supabase = createClient()
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", id)
        .eq("store_id", store.id)

      if (!error) {
        setForms((prev) => prev.filter((f) => f.id !== id))
      }
    },
    [store?.id]
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Formulários</h1>
        <Link
          href="/forms/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Criar Formulário
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-14" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : forms.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Nome
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Tipo
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Impressões
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Submissions
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Taxa Conversão
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Criado em
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr
                  key={form.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {form.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeStyles[form.type]}`}
                    >
                      {typeLabels[form.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyles[form.status]}`}
                    >
                      {statusLabels[form.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">
                    {form.impressions.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">
                    {form.submissions.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">
                    {conversionRate(form.impressions, form.submissions)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(form.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/forms/${form.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <Link
                        href={`/forms/${form.id}?tab=analytics`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Analytics"
                      >
                        <BarChart3 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
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
            <ClipboardList size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhum formulário criado
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Capture leads com formulários personalizados
            </p>
            <Link
              href="/forms/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Criar Formulário
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
