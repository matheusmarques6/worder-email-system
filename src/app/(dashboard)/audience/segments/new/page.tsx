"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { prebuiltSegments } from "@/lib/segments/prebuilt"
import type { RuleGroupType } from "react-querybuilder"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { SegmentBuilder } from "@/components/segments/segment-builder"
import { SegmentPreview } from "@/components/segments/segment-preview"

const defaultQuery: RuleGroupType = {
  combinator: "and",
  rules: [],
}

export default function NewSegmentPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>}>
      <NewSegmentContent />
    </Suspense>
  )
}

function NewSegmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { store, loading: storeLoading } = useStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [query, setQuery] = useState<RuleGroupType>(defaultQuery)
  const [submitting, setSubmitting] = useState(false)

  // Apply prebuilt segment if provided via query param
  useEffect(() => {
    const prebuiltId = searchParams.get("prebuilt")
    if (prebuiltId) {
      const prebuilt = prebuiltSegments.find((p) => p.id === prebuiltId)
      if (prebuilt) {
        setName(prebuilt.name)
        setDescription(prebuilt.description)
        setQuery(prebuilt.rules)
      }
    }
  }, [searchParams])

  async function handleSave() {
    if (!store) return

    if (!name.trim()) {
      toast.error("Nome do segmento é obrigatório")
      return
    }

    if (query.rules.length === 0) {
      toast.error("Adicione pelo menos uma condição ao segmento")
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from("segments").insert({
      store_id: store.id,
      name: name.trim(),
      description: description.trim() || null,
      rules: JSON.stringify(query),
      is_prebuilt: false,
      contact_count: 0,
    })

    if (error) {
      toast.error("Erro ao criar segmento")
      setSubmitting(false)
      return
    }

    toast.success("Segmento criado com sucesso")
    router.push("/audience/segments")
  }

  if (storeLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/audience/segments"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-[18px] w-[18px]" />
        Voltar para Segmentos
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Criar Segmento
        </h1>
        <Button
          className="bg-brand-500 hover:bg-brand-600 text-white"
          onClick={handleSave}
          disabled={submitting}
        >
          <Save className="mr-2 h-[18px] w-[18px]" />
          {submitting ? "Criando..." : "Criar Segmento"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome do segmento <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Clientes VIP"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descrição
              </label>
              <Textarea
                placeholder="Descrição opcional do segmento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Condições
            </h2>
            <SegmentBuilder query={query} onQueryChange={setQuery} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <SegmentPreview
            rules={query.rules.length > 0 ? query : null}
            storeId={store?.id ?? ""}
          />
        </div>
      </div>
    </div>
  )
}
