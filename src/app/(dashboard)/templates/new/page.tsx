"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function NewTemplatePage() {
  const router = useRouter()
  const { store } = useStore()
  const [name, setName] = useState("")
  const [type, setType] = useState<"email" | "whatsapp">("email")
  const [subject, setSubject] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!store?.id) {
      toast.error("Loja não encontrada")
      return
    }

    if (!name.trim()) {
      toast.error("Nome do template é obrigatório")
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
        html: null,
        design_json: null,
      })
      .select("id")
      .single()

    if (error) {
      toast.error("Erro ao criar template")
      setSubmitting(false)
      return
    }

    toast.success("Template criado com sucesso")
    router.push(`/templates/${data.id}/edit`)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/templates"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[24px] font-semibold text-gray-900">
            Novo Template
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha as informações do template
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome do template
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boas-vindas, Recuperação de carrinho"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoria
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "email" | "whatsapp")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Assunto */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Assunto
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Bem-vindo à nossa loja!"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? "Criando..." : "Criar e Editar"}
            </button>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
