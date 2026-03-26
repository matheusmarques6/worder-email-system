"use client"

import Link from "next/link"
import { User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Conversation } from "@/types/inbox"

interface ContactPanelProps {
  conversation: Conversation | null
  contactDetails: {
    total_spent: number
    total_orders: number
    last_order_at: string | null
    city: string | null
    state: string | null
    lists: string[]
    recent_orders: { id: string; total: number; date: string }[]
    recent_campaigns: { id: string; name: string; date: string }[]
  } | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function ContactPanel({ conversation, contactDetails }: ContactPanelProps) {
  if (!conversation) {
    return <div className="hidden w-80 border-l border-gray-200 bg-white lg:block" />
  }

  const contact = conversation.contact
  const name = `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim() || "Sem nome"
  const initials = `${contact?.first_name?.[0] || ""}${contact?.last_name?.[0] || ""}`.toUpperCase() || "?"

  return (
    <div className="hidden w-80 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white lg:block">
      {/* Contact card */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
            {initials}
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          {contact?.email && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Mail size={12} /> {contact.email}
            </p>
          )}
          {contact?.phone && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Phone size={12} /> {contact.phone}
            </p>
          )}
          {contactDetails?.city && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> {contactDetails.city}{contactDetails.state ? `, ${contactDetails.state}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="border-b border-gray-200 p-4">
        <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Métricas</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-2.5">
            <DollarSign size={14} className="text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Total Gasto</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(contactDetails?.total_spent || 0)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2.5">
            <ShoppingBag size={14} className="text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Pedidos</p>
            <p className="text-sm font-semibold text-gray-900">{contactDetails?.total_orders || 0}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2.5">
            <Calendar size={14} className="text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Última compra</p>
            <p className="text-sm font-semibold text-gray-900">
              {contactDetails?.last_order_at
                ? new Date(contactDetails.last_order_at).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2.5">
            <DollarSign size={14} className="text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">CLV est.</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency((contactDetails?.total_spent || 0) * 1.5)}
            </p>
          </div>
        </div>
      </div>

      {/* Lists */}
      {contactDetails?.lists && contactDetails.lists.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Listas</h4>
          <div className="flex flex-wrap gap-1.5">
            {contactDetails.lists.map((list) => (
              <Badge key={list} variant="secondary" className="text-xs">
                {list}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {contactDetails?.recent_orders && contactDetails.recent_orders.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Últimos Pedidos</h4>
          <div className="space-y-2">
            {contactDetails.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">#{order.id.slice(0, 8)}</span>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-900">{formatCurrency(order.total)}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(order.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent campaigns */}
      {contactDetails?.recent_campaigns && contactDetails.recent_campaigns.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Últimas Campanhas</h4>
          <div className="space-y-2">
            {contactDetails.recent_campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 truncate flex-1">{campaign.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(campaign.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View profile */}
      {conversation.contact_id && (
        <div className="p-4">
          <Link href={`/audience/profiles/${conversation.contact_id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink size={14} className="mr-2" />
              Ver Perfil Completo
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
