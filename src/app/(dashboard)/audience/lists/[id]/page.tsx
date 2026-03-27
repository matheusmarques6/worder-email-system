"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import type { List, ListMember, Contact } from "@/types/database"
import { format } from "date-fns"
import {
  ArrowLeft,
  UserPlus,
  Upload,
  Download,
  Trash2,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"

const PAGE_SIZE = 20

export default function ListDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()

  const [list, setList] = useState<List | null>(null)
  const [members, setMembers] = useState<ListMember[]>([])
  const [totalMembers, setTotalMembers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [searching, setSearching] = useState(false)
  const [addingContactId, setAddingContactId] = useState<string | null>(null)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

  const listId = params.id

  const fetchList = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("id", listId)
      .eq("store_id", store.id)
      .single()

    if (error || !data) {
      toast.error("Lista não encontrada")
      router.push("/audience/lists")
      return
    }

    setList(data as List)
  }, [store, listId, router])

  const fetchMembers = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from("list_members")
      .select("*, contact:contacts(*)", { count: "exact" })
      .eq("list_id", listId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      toast.error("Erro ao carregar membros")
      return
    }

    setMembers((data as ListMember[]) ?? [])
    setTotalMembers(count ?? 0)
    setLoading(false)
  }, [store, listId, page])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchList()
      fetchMembers()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [store, storeLoading, fetchList, fetchMembers])

  async function handleSearchContacts(query: string) {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("store_id", store!.id)
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(10)

    if (error) {
      toast.error("Erro ao buscar contatos")
      setSearching(false)
      return
    }

    setSearchResults((data as Contact[]) ?? [])
    setSearching(false)
  }

  async function handleAddContact(contactId: string) {
    setAddingContactId(contactId)
    const supabase = createClient()

    const { error } = await supabase.from("list_members").insert({
      list_id: listId,
      contact_id: contactId,
      status: "active",
    })

    if (error) {
      if (error.code === "23505") {
        toast.error("Contato já está nesta lista")
      } else {
        toast.error("Erro ao adicionar contato")
      }
      setAddingContactId(null)
      return
    }

    toast.success("Contato adicionado à lista")
    setAddingContactId(null)
    setAddDialogOpen(false)
    setSearchQuery("")
    setSearchResults([])
    fetchMembers()
  }

  async function handleRemoveMember(memberId: string) {
    setRemovingMemberId(memberId)
    const supabase = createClient()

    const { error } = await supabase
      .from("list_members")
      .delete()
      .eq("id", memberId)

    if (error) {
      toast.error("Erro ao remover membro")
      setRemovingMemberId(null)
      return
    }

    toast.success("Membro removido da lista")
    setRemovingMemberId(null)
    fetchMembers()
  }

  const totalPages = Math.ceil(totalMembers / PAGE_SIZE)

  function getContactName(member: ListMember): string {
    const contact = member.contact
    if (!contact) return "—"
    const parts = [contact.first_name, contact.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(" ") : "—"
  }

  function getContactEmail(member: ListMember): string {
    return member.contact?.email ?? "—"
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
            <Skeleton className="h-10 w-32" />
          </div>
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

  if (!list) return null

  return (
    <div className="space-y-6">
      <Link
        href="/audience/lists"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-[18px] w-[18px]" />
        Voltar para Listas
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {list.name}
            </h1>
            {list.opt_in_type === "double" ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Double Opt-in
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                Single Opt-in
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {totalMembers.toLocaleString("pt-BR")}{" "}
            {totalMembers === 1 ? "membro" : "membros"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-brand-500 hover:bg-brand-600 text-white"
            onClick={() => setAddDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-[18px] w-[18px]" />
            Adicionar Contato
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-[18px] w-[18px]" />
            Importar CSV
          </Button>
          <Button variant="ghost">
            <Download className="mr-2 h-[18px] w-[18px]" />
            Exportar
          </Button>
        </div>
      </div>

      {members.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-16 shadow-sm">
          <UserPlus className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum membro nesta lista
          </h3>
          <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
            Adicione contatos manualmente ou importe um CSV
          </p>
          <Button
            className="mt-6 bg-brand-500 hover:bg-brand-600 text-white"
            onClick={() => setAddDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-[18px] w-[18px]" />
            Adicionar Contato
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-gray-900">
                    {getContactName(member)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {getContactEmail(member)}
                  </TableCell>
                  <TableCell>
                    {member.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                        Descadastrado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(member.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingMemberId === member.id}
                    >
                      <Trash2 className="h-[18px] w-[18px]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-500">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contato</DialogTitle>
            <DialogDescription>
              Busque por email ou nome para adicionar à lista
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por email ou nome..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearchContacts(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {searching && (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              )}

              {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                  Nenhum contato encontrado
                </p>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between py-3 px-1"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {[contact.first_name, contact.last_name]
                            .filter(Boolean)
                            .join(" ") || "Sem nome"}
                        </p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-brand-500 hover:bg-brand-600 text-white"
                        onClick={() => handleAddContact(contact.id)}
                        disabled={addingContactId === contact.id}
                      >
                        {addingContactId === contact.id
                          ? "Adicionando..."
                          : "Adicionar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!searching && searchQuery.trim().length < 2 && (
                <p className="py-6 text-center text-sm text-gray-500">
                  Digite pelo menos 2 caracteres para buscar
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
