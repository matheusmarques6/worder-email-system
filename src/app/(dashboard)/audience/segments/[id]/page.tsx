"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import type { Segment } from "@/types/database"
import type { RuleGroupType } from "react-querybuilder"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { SegmentBuilder } from "@/components/segments/segment-builder"
import { SegmentPreview } from "@/components/segments/segment-preview"

const defaultQuery: RuleGroupType = {
  combinator: "and",
  rules: [],
}

export default function SegmentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()

  const [segment, setSegment] = useState<Segment | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [query, setQuery] = useState<RuleGroupType>(defaultQuery)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const segmentId = params.id

  const fetchSegment = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("segments")
      .select("*")
      .eq("id", segmentId)
      .eq("store_id", store.id)
      .single()

    if (error || !data) {
      toast.error("Segmento não encontrado")
      router.push("/audience/segments")
      return
    }

    const seg = data as Segment
    setSegment(seg)
    setName(seg.name)
    setDescription(seg.description ?? "")

    if (seg.rules) {
      try {
        const parsedRules = JSON.parse(seg.rules) as RuleGroupType
        setQuery(parsedRules)
      } catch {
        setQuery(defaultQuery)
      }
    }

    setLoading(false)
  }, [store, segmentId, router])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchSegment()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [store, storeLoading, fetchSegment])

  async function handleSave() {
    if (!store || !segment) return

    if (!name.trim()) {
      toast.error("Nome do segmento é obrigatório")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("segments")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        rules: JSON.stringify(query),
        updated_at: new Date().toISOString(),
      })
      .eq("id", segment.id)
      .eq("store_id", store.id)

    if (error) {
      toast.error("Erro ao salvar segmento")
      setSaving(false)
      return
    }

    toast.success("Segmento atualizado com sucesso")
    setSaving(false)
  }

  async function handleDelete() {
    if (!store || !segment) return

    setDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("segments")
      .delete()
      .eq("id", segment.id)
      .eq("store_id", store.id)

    if (error) {
      toast.error("Erro ao excluir segmento")
      setDeleting(false)
      return
    }

    toast.success("Segmento excluído com sucesso")
    router.push("/audience/segments")
  }

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!segment) return null

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
        <div className="flex items-center gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-semibold text-gray-900 border-none shadow-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 max-w-md"
          />
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {(segment.contact_count ?? 0).toLocaleString("pt-BR")} contatos
          </Badge>
          {segment.is_prebuilt && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Pré-construído
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-[18px] w-[18px]" />
            Excluir Segmento
          </Button>
          <Button
            className="bg-brand-500 hover:bg-brand-600 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-[18px] w-[18px]" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Segmento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o segmento &ldquo;{segment.name}
              &rdquo;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir Segmento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
