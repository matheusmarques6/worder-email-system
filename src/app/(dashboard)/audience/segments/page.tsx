"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { prebuiltSegments } from "@/lib/segments/prebuilt"
import type { Segment } from "@/types/database"
import { format } from "date-fns"
import {
  Filter,
  Plus,
  ChevronRight,
  Sparkles,
  UserX,
  Repeat,
  UserPlus,
  ShoppingBag,
  AlertTriangle,
  Crown,
  ShoppingCart,
  Heart,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  UserX,
  Repeat,
  UserPlus,
  ShoppingBag,
  AlertTriangle,
  Crown,
  ShoppingCart,
  Heart,
}

function getPrebuiltIcon(iconName: string) {
  return iconMap[iconName] ?? Filter
}

export default function SegmentsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSegments = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("segments")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Erro ao carregar segmentos")
      return
    }

    setSegments((data as Segment[]) ?? [])
    setLoading(false)
  }, [store])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchSegments()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [store, storeLoading, fetchSegments])

  function handleApplyPrebuilt(prebuiltId: string) {
    const prebuilt = prebuiltSegments.find((p) => p.id === prebuiltId)
    if (!prebuilt) return

    const params = new URLSearchParams({
      prebuilt: prebuiltId,
    })
    router.push(`/audience/segments/new?${params.toString()}`)
  }

  const customSegments = segments.filter((s) => !s.is_prebuilt)

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Segmentos</h1>
        <Link href="/audience/segments/new">
          <Button className="bg-brand-500 hover:bg-brand-600 text-white">
            <Plus className="mr-2 h-[18px] w-[18px]" />
            Criar Segmento
          </Button>
        </Link>
      </div>

      {customSegments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-16 shadow-sm">
          <Filter className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum segmento personalizado
          </h3>
          <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
            Crie segmentos para direcionar campanhas aos contatos certos
          </p>
          <Link href="/audience/segments/new">
            <Button className="mt-6 bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="mr-2 h-[18px] w-[18px]" />
              Criar Segmento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow
                  key={segment.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    router.push(`/audience/segments/${segment.id}`)
                  }
                >
                  <TableCell className="font-medium text-gray-900">
                    {segment.name}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-[200px] truncate">
                    {segment.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                      {(segment.contact_count ?? 0).toLocaleString("pt-BR")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {segment.is_prebuilt ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Pré-construído
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                        Personalizado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(segment.updated_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-[18px] w-[18px] text-gray-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Segmentos prontos para usar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {prebuiltSegments.map((prebuilt) => {
            const IconComponent = getPrebuiltIcon(prebuilt.icon)
            return (
              <button
                key={prebuilt.id}
                type="button"
                className="flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all text-left"
                onClick={() => handleApplyPrebuilt(prebuilt.id)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <IconComponent className="h-[18px] w-[18px] text-brand-500" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900">
                  {prebuilt.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {prebuilt.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
