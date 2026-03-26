"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import {
  ShoppingCart,
  Mail,
  Eye,
  MousePointerClick,
  CreditCard,
  Truck,
  ShoppingBag,
  UserPlus,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Event {
  id: string
  store_id: string
  contact_id: string
  event_type: string
  properties: Record<string, unknown>
  revenue: number | null
  created_at: string
}

interface ContactTimelineProps {
  events: Event[]
}

const EVENT_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string }
> = {
  placed_order: { icon: ShoppingCart, label: "Pedido Realizado" },
  email_sent: { icon: Mail, label: "Email Enviado" },
  email_opened: { icon: Eye, label: "Email Aberto" },
  email_clicked: { icon: MousePointerClick, label: "Email Clicado" },
  order_paid: { icon: CreditCard, label: "Pagamento Confirmado" },
  order_fulfilled: { icon: Truck, label: "Pedido Enviado" },
  started_checkout: { icon: ShoppingBag, label: "Checkout Iniciado" },
  customer_created: { icon: UserPlus, label: "Cliente Criado" },
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function EventItem({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false)
  const config = EVENT_CONFIG[event.event_type] ?? {
    icon: Activity,
    label: event.event_type,
  }
  const Icon = config.icon

  return (
    <div className="flex gap-4 py-4">
      <div className="flex-shrink-0">
        <div className="bg-gray-100 p-2 rounded-full">
          <Icon size={18} className="text-gray-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {config.label}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(event.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {event.revenue !== null && event.revenue > 0 && (
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(event.revenue)}
              </span>
            )}
            {event.properties &&
              Object.keys(event.properties).length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {expanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              )}
          </div>
        </div>
        {expanded && event.properties && (
          <pre className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(event.properties, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export function ContactTimeline({ events }: ContactTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Activity size={48} className="text-gray-300 mb-4" />
        <p className="text-sm text-gray-500">Nenhum evento registrado</p>
      </div>
    )
  }

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="divide-y divide-gray-100">
      {sortedEvents.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  )
}
