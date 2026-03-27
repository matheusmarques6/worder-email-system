"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

type TemplateType = "email" | "whatsapp"

export default function NewTemplatePage() {
  const [name, setName] = useState("")
  const [type, setType] = useState<TemplateType>("email")
  const [submitting, setSubmitting] = useState(false)
  const { store } = useStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({ title: "Informe o nome do template", variant: "destructive" })
      return
    }

    if (!store?.id) {
      toast({ title: "Loja não encontrada", variant: "destructive" })
      return
    }

    setSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("templates")
      .insert({
        store_id: store.id,
        name: name.trim(),
        type,
      })
      .select("id")
      .single()

    if (error || !data) {
      toast({ title: "Erro ao criar template", variant: "destructive" })
      setSubmitting(false)
      return
    }

    toast({ title: "Template criado com sucesso" })
    router.push(`/templates/${data.id}/edit`)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Back link */}
      <Link
        href="/templates"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para Templates
      </Link>

      <h1 className="text-[24px] font-semibold text-gray-900 mb-6">
        Novo Template
      </h1>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Template name */}
          <div>
            <label
              htmlFor="template-name"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nome do template
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boas-vindas, Carrinho abandonado..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            />
          </div>

          {/* Template type */}
          <div>
            <label
              htmlFor="template-type"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Tipo
            </label>
            <select
              id="template-type"
              value={type}
              onChange={(e) => setType(e.target.value as TemplateType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full"
          >
            {submitting ? "Criando..." : "Criar e Editar"}
          </button>
        </form>
      </div>
    </div>
  )
}
