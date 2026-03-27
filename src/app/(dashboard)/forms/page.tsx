"use client"

import { useState, useEffect } from "react"
import { Plus, FileText } from "lucide-react"
import { useStore } from "@/hooks/use-store"

export default function FormsPage() {
  const { store } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (store?.id) setLoading(false)
  }, [store?.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Formulários</h1>
        <button className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          <Plus size={18} />
          Novo Formulário
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <FileText size={48} className="text-gray-300 mb-4" />
          <h2 className="text-[18px] font-semibold text-gray-900 mb-1">Nenhum formulário criado</h2>
          <p className="text-sm text-gray-500 mb-6">Crie formulários de captura para coletar leads.</p>
          <button className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            <Plus size={18} />
            Novo Formulário
          </button>
        </div>
      </div>
    </div>
  )
}
