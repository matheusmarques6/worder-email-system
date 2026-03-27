"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import SegmentBuilder from "@/components/segments/segment-builder"

export default function NewSegmentPage() {
  const { store } = useStore()
  const router = useRouter()
  const [name, setName] = useState("")

  async function handleSave(rules: { combinator: "and" | "or"; rules: Array<{ field: string; operator: string; value: string | number | boolean }> }) {
    if (!store?.id) return
    if (!name.trim()) {
      toast.error("Insira um nome para o segmento")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("segments").insert({
      store_id: store.id,
      name: name.trim(),
      rules,
      contact_count: 0,
    })

    if (error) {
      toast.error("Erro ao criar segmento")
    } else {
      toast.success("Segmento criado com sucesso")
      router.push("/audience/segments")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Link href="/audience/segments" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Voltar para Segmentos
      </Link>

      <h1 className="text-[24px] font-semibold text-gray-900 mb-6">Novo Segmento</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Segmento</label>
        <input
          type="text"
          placeholder="Ex: Clientes VIP"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <SegmentBuilder onSave={handleSave} />
    </div>
  )
}
