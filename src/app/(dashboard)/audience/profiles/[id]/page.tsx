"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import {
  ArrowLeft,
  Copy,
  MapPin,
  Mail,
  Phone,
  Plus,
  Pencil,
  Ban,
  Tag,
  ListIcon,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import type { Contact } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ContactTimeline } from "@/components/contacts/contact-timeline"

type ContactWithStats = Contact

interface Event {
  id: string
  store_id: string
  contact_id: string
  event_type: string
  properties: Record<string, unknown>
  revenue: number | null
  created_at: string
}

interface EmailSendRecord {
  id: string
  store_id: string
  campaign_id: string | null
  contact_id: string
  subject?: string
  status: string
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
}

interface ListMembership {
  id: string
  list_id: string
  contact_id: string
  status: string
  created_at: string
  list: {
    id: string
    name: string
    description: string | null
  }
}

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return "R$ 0,00"
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function getStatusBadge(status: string) {
  const config: Record<string, { className: string; label: string }> = {
    queued: {
      className: "bg-gray-100 text-gray-600 border-gray-200",
      label: "Na fila",
    },
    sent: {
      className: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Enviado",
    },
    delivered: {
      className: "bg-green-100 text-green-700 border-green-200",
      label: "Entregue",
    },
    opened: {
      className: "bg-green-100 text-green-700 border-green-200",
      label: "Aberto",
    },
    clicked: {
      className: "bg-brand-100 text-brand-700 border-brand-200",
      label: "Clicado",
    },
    bounced: {
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      label: "Bounce",
    },
    failed: {
      className: "bg-red-100 text-red-700 border-red-200",
      label: "Falhou",
    },
  }

  const c = config[status] ?? {
    className: "bg-gray-100 text-gray-600 border-gray-200",
    label: status,
  }

  return <Badge className={c.className}>{c.label}</Badge>
}

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()

  const [contact, setContact] = useState<ContactWithStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [emailSends, setEmailSends] = useState<EmailSendRecord[]>([])
  const [listMemberships, setListMemberships] = useState<ListMembership[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!store || !params.id) return

    setLoading(true)
    const supabase = createClient()

    const [contactRes, eventsRes, emailsRes, listsRes] = await Promise.all([
      supabase
        .from("contacts")
        .select("*")
        .eq("id", params.id)
        .eq("store_id", store.id)
        .single(),
      supabase
        .from("events")
        .select("*")
        .eq("contact_id", params.id)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("email_sends")
        .select("*")
        .eq("contact_id", params.id)
        .eq("store_id", store.id)
        .order("sent_at", { ascending: false })
        .limit(50),
      supabase
        .from("list_members")
        .select("*, list:lists(id, name, description)")
        .eq("contact_id", params.id)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false }),
    ])

    setContact((contactRes.data as ContactWithStats) ?? null)
    setEvents((eventsRes.data as Event[]) ?? [])
    setEmailSends((emailsRes.data as EmailSendRecord[]) ?? [])
    setListMemberships((listsRes.data as ListMembership[]) ?? [])
    setLoading(false)
  }, [store, params.id])

  useEffect(() => {
    if (store) {
      fetchData()
    }
  }, [store, fetchData])

  function copyEmail() {
    if (contact?.email) {
      navigator.clipboard.writeText(contact.email)
      toast.success("Email copiado!")
    }
  }

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[400px] col-span-1 rounded-lg" />
          <Skeleton className="h-[400px] col-span-2 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-gray-500 mb-4">Contato não encontrado.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/audience/profiles")}
        >
          <ArrowLeft size={18} />
          Voltar para contatos
        </Button>
      </div>
    )
  }

  const fullName = [contact.first_name, contact.last_name]
    .filter(Boolean)
    .join(" ")
  const initials = [contact.first_name?.[0], contact.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || contact.email[0].toUpperCase()
  const location = [contact.city, contact.state, contact.country]
    .filter(Boolean)
    .join(", ")
  const tags = contact.tags ?? []
  const orderEvents = events.filter((e) => e.event_type === "placed_order")

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/audience/profiles")}
      >
        <ArrowLeft size={18} />
        Voltar para contatos
      </Button>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column - Profile card */}
        <div className="col-span-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-6">
            {/* Avatar and basic info */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-semibold mb-3">
                {initials}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {fullName || contact.email}
              </h2>

              {/* Email */}
              <div className="flex items-center gap-1 mt-1">
                <Mail size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">{contact.email}</span>
                <button
                  onClick={copyEmail}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                  title="Copiar email"
                >
                  <Copy size={14} />
                </button>
              </div>

              {/* Phone */}
              {contact.phone && (
                <div className="flex items-center gap-1 mt-1">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {contact.phone}
                  </span>
                </div>
              )}

              {/* Location */}
              {location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{location}</span>
                </div>
              )}
            </div>

            {/* Consent */}
            <div className="flex justify-center">
              {contact.subscribed ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Inscrito
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  Cancelado
                </Badge>
              )}
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tags</span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Nenhuma tag adicionada</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(contact.total_spent)}
                </p>
                <p className="text-xs text-gray-500">Total gasto</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {contact.total_orders ?? 0}
                </p>
                <p className="text-xs text-gray-500">Pedidos</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" className="flex-1">
                <Pencil size={18} />
                Editar
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Ban size={18} />
                Suprimir
              </Button>
            </div>

            {/* Created date */}
            <p className="text-xs text-gray-400 text-center">
              Criado em{" "}
              {format(new Date(contact.created_at), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {/* Right column - Tabs */}
        <div className="col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="lists">Listas</TabsTrigger>
            </TabsList>

            {/* Timeline tab */}
            <TabsContent value="timeline">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                <ContactTimeline events={events} />
              </div>
            </TabsContent>

            {/* Emails tab */}
            <TabsContent value="emails">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
                {emailSends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Mail size={48} className="text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">
                      Nenhum email enviado para este contato
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enviado em</TableHead>
                        <TableHead>Aberto em</TableHead>
                        <TableHead>Clicado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailSends.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell className="font-medium text-gray-900">
                            {email.subject || "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(email.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {email.sent_at
                              ? format(
                                  new Date(email.sent_at),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR }
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {email.opened_at
                              ? format(
                                  new Date(email.opened_at),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR }
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {email.clicked_at
                              ? format(
                                  new Date(email.clicked_at),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR }
                                )
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* Orders tab */}
            <TabsContent value="orders">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
                {orderEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ListIcon size={48} className="text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">
                      Nenhum pedido registrado para este contato
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido #</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderEvents.map((event) => {
                        const props = event.properties
                        const orderNumber =
                          (props.order_number as string) ?? "-"
                        const items =
                          (props.items_count as number) ??
                          (props.items as unknown[])?.length ??
                          "-"

                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium text-gray-900">
                              #{orderNumber}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrency(event.revenue)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {String(items)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {format(
                                new Date(event.created_at),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* Lists tab */}
            <TabsContent value="lists">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Listas do contato
                  </h3>
                  <Button variant="outline" size="sm">
                    <Plus size={18} />
                    Adicionar a lista
                  </Button>
                </div>
                {listMemberships.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <ListIcon size={48} className="text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">
                      Este contato não pertence a nenhuma lista
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listMemberships.map((membership) => (
                      <div
                        key={membership.id}
                        className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {membership.list?.name ?? "Lista removida"}
                          </p>
                          {membership.list?.description && (
                            <p className="text-xs text-gray-500">
                              {membership.list.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            membership.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }
                        >
                          {membership.status === "active"
                            ? "Ativo"
                            : "Cancelado"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
