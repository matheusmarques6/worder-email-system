"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import type { List } from "@/types/database"
import { format } from "date-fns"
import { List as ListIcon, Plus, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ListWithCount extends List {
  list_members: { count: number }[]
}

export default function ListsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [lists, setLists] = useState<ListWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [optInType, setOptInType] = useState<"single" | "double">("single")

  const fetchLists = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("lists")
      .select("*, list_members(count)")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Erro ao carregar listas")
      return
    }

    setLists((data as ListWithCount[]) ?? [])
    setLoading(false)
  }, [store])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchLists()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [store, storeLoading, fetchLists])

  function resetForm() {
    setName("")
    setDescription("")
    setOptInType("single")
  }

  async function handleCreateList() {
    if (!store) return
    if (!name.trim()) {
      toast.error("Nome da lista é obrigatório")
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from("lists").insert({
      store_id: store.id,
      name: name.trim(),
      description: description.trim() || null,
      opt_in_type: optInType,
    })

    if (error) {
      toast.error("Erro ao criar lista")
      setSubmitting(false)
      return
    }

    toast.success("Lista criada com sucesso")
    setDialogOpen(false)
    resetForm()
    setSubmitting(false)
    fetchLists()
  }

  function getMemberCount(list: ListWithCount): number {
    return list.list_members?.[0]?.count ?? 0
  }

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Listas</h1>
        <Button
          className="bg-brand-500 hover:bg-brand-600 text-white"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-[18px] w-[18px]" />
          Criar Lista
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-16 shadow-sm">
          <ListIcon className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhuma lista criada
          </h3>
          <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
            Organize seus contatos em listas para campanhas segmentadas
          </p>
          <Button
            className="mt-6 bg-brand-500 hover:bg-brand-600 text-white"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-[18px] w-[18px]" />
            Criar Lista
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lists.map((list) => (
                <TableRow
                  key={list.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/audience/lists/${list.id}`)}
                >
                  <TableCell className="font-medium text-gray-900">
                    {list.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {getMemberCount(list).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {list.opt_in_type === "double" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Double Opt-in
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        Single Opt-in
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(list.created_at), "dd/MM/yyyy")}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Lista</DialogTitle>
            <DialogDescription>
              Crie uma nova lista para organizar seus contatos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Newsletter Principal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descrição
              </label>
              <Textarea
                placeholder="Descrição opcional da lista"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Opt-in
              </label>
              <Select
                value={optInType}
                onValueChange={(value: "single" | "double") =>
                  setOptInType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Opt-in</SelectItem>
                  <SelectItem value="double">Double Opt-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-brand-500 hover:bg-brand-600 text-white"
              onClick={handleCreateList}
              disabled={submitting}
            >
              {submitting ? "Criando..." : "Criar Lista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
