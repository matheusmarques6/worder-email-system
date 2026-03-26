"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { format } from "date-fns"
import { ClipboardList, Plus } from "lucide-react"
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

interface Form {
  id: string
  store_id: string
  name: string
  type: "popup" | "embedded" | "landing"
  status: "active" | "inactive"
  config: Record<string, unknown>
  submissions_count: number
  conversion_rate: number
  created_at: string
  updated_at: string
}

const typeLabels: Record<Form["type"], string> = {
  popup: "Popup",
  embedded: "Embedded",
  landing: "Landing Page",
}

const typeColors: Record<Form["type"], string> = {
  popup: "bg-amber-100 text-amber-800",
  embedded: "bg-blue-100 text-blue-800",
  landing: "bg-green-100 text-green-800",
}

const statusLabels: Record<Form["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
}

const statusColors: Record<Form["status"], string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
}

export default function FormsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  const fetchForms = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Erro ao carregar formulários")
      return
    }

    setForms((data as Form[]) ?? [])
    setLoading(false)
  }, [store])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchForms()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [storeLoading, store, fetchForms])

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Formulários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Capture leads com formulários e popups
          </p>
        </div>
        <Button
          onClick={() => router.push("/forms/new")}
          className="bg-brand-500 hover:bg-brand-600 text-white"
        >
          <Plus className="mr-2 h-[18px] w-[18px]" />
          Criar Formulário
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Nenhum formulário criado
            </h3>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
              Crie formulários para capturar leads no seu site
            </p>
            <Button
              onClick={() => router.push("/forms/new")}
              className="mt-6 bg-brand-500 hover:bg-brand-600 text-white"
            >
              <Plus className="mr-2 h-[18px] w-[18px]" />
              Criar Formulário
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Submissões</TableHead>
                <TableHead className="text-right">Taxa de Conversão</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow
                  key={form.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/forms/${form.id}`)}
                >
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={typeColors[form.type]}
                    >
                      {typeLabels[form.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[form.status]}
                    >
                      {statusLabels[form.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {form.submissions_count.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {form.conversion_rate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(form.created_at), "dd/MM/yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
