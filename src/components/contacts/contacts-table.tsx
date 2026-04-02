"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  List,
  Users,
} from "lucide-react"
import type { Contact } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ContactWithStats extends Contact {
  total_spent?: number
  total_orders?: number
  tags?: string[]
  city?: string | null
  state?: string | null
  country?: string | null
  consent_email?: string
  consent_whatsapp?: string
  properties?: Record<string, unknown>
}

interface ContactsTableProps {
  contacts: ContactWithStats[]
  total: number
  page: number
  search: string
  filter: string
}

const PAGE_SIZE = 20

export function ContactsTable({
  contacts,
  total,
  page,
  search,
  filter,
}: ContactsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchValue, setSearchValue] = useState(search)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      router.push(`/audience/profiles?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      searchTimeoutRef.current = setTimeout(() => {
        updateParams({ search: value, page: "1" })
      }, 400)
    },
    [updateParams]
  )

  const handleFilterChange = useCallback(
    (value: string) => {
      updateParams({ filter: value === "all" ? "" : value, page: "1" })
    },
    [updateParams]
  )

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)))
    }
  }, [contacts, selectedIds.size])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const startIndex = (page - 1) * PAGE_SIZE + 1
  const endIndex = Math.min(page * PAGE_SIZE, total)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return "R$ 0,00"
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function getConsentBadge(contact: ContactWithStats) {
    if (contact.subscribed) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Inscrito
        </Badge>
      )
    }
    if (contact.consent_email === "pending") {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
          Pendente
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        Cancelado
      </Badge>
    )
  }

  if (contacts.length === 0 && !search && !filter) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Nenhum contato ainda
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Conecte Shopify ou importe CSV para adicionar contatos
        </p>
        <Button variant="default">Importar CSV</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Buscar contatos..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filter || "all"}
          onValueChange={handleFilterChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="subscribed">Inscritos</SelectItem>
            <SelectItem value="unsubscribed">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.size} selecionado(s)
          </span>
          <Button variant="outline" size="sm">
            <Tag size={18} />
            Adicionar tag
          </Button>
          <Button variant="outline" size="sm">
            <Tag size={18} />
            Remover tag
          </Button>
          <Button variant="outline" size="sm">
            <List size={18} />
            Adicionar à lista
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    contacts.length > 0 &&
                    selectedIds.size === contacts.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Total Gasto</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Consentimento</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Nenhum contato encontrado para esta busca
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => {
                const fullName = [contact.first_name, contact.last_name]
                  .filter(Boolean)
                  .join(" ")
                const tags = contact.tags ?? []
                const visibleTags = tags.slice(0, 3)
                const remainingTags = tags.length - 3

                return (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/audience/profiles/${contact.id}`)
                    }
                  >
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(contact.id)}
                        onCheckedChange={() => toggleSelect(contact.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {fullName || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {contact.email}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {contact.phone || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatCurrency(contact.total_spent)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {contact.total_orders ?? 0}
                    </TableCell>
                    <TableCell>{getConsentBadge(contact)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {visibleTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {remainingTags > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            +{remainingTags}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(contact.created_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {startIndex}-{endIndex} de {total} contatos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                updateParams({ page: String(page - 1) })
              }
            >
              <ChevronLeft size={18} />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                updateParams({ page: String(page + 1) })
              }
            >
              Próximo
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
