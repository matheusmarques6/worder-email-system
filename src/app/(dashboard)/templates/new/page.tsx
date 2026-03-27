"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const categoryOptions = [
  { value: "e-commerce", label: "E-commerce" },
  { value: "welcome", label: "Welcome" },
  { value: "abandono", label: "Abandono de carrinho" },
  { value: "pos-compra", label: "Pós-compra" },
  { value: "newsletter", label: "Newsletter" },
  { value: "custom", label: "Custom" },
]

const prebuiltTemplates = [
  { key: "welcome", name: "Boas-vindas", category: "welcome" },
  { key: "abandoned-cart", name: "Carrinho Abandonado", category: "abandono" },
  { key: "order-confirm", name: "Confirmação de Pedido", category: "pos-compra" },
  { key: "post-purchase", name: "Pós-compra", category: "pos-compra" },
  { key: "newsletter", name: "Newsletter", category: "newsletter" },
]

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [category, setCategory] = useState("custom")
  const [loading, setLoading] = useState(false)

  async function createTemplate() {
    if (!name.trim()) return alert("Digite um nome para o template")
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).single()
    if (!store) { setLoading(false); return }
    const { data, error } = await supabase.from("templates").insert({ store_id: store.id, name: name.trim(), category }).select().single()
    if (error || !data) { setLoading(false); return }
    router.push(`/templates/${data.id}/edit`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/templates" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Voltar</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Novo Template</h1>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nome do template</label>
            <input placeholder="Ex: Newsletter Semanal" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Escolha como começar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={createTemplate} disabled={loading}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 transition-colors hover:border-brand-500 hover:bg-brand-50">
            <Plus size={32} className="mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Em branco</span>
            <span className="text-xs text-gray-400">Comece do zero</span>
          </button>
          {prebuiltTemplates.map((pt) => (
            <button key={pt.key} onClick={() => { setCategory(pt.category); createTemplate() }} disabled={loading}
              className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-colors hover:border-brand-500 hover:bg-brand-50">
              <Mail size={32} className="mb-2 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{pt.name}</span>
              <span className="text-xs text-gray-400">{pt.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
