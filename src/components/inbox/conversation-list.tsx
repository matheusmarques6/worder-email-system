"use client"

import { useState } from "react"
import { Search, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Conversation, InboxFilter } from "@/types/inbox"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const filters: { key: InboxFilter; label: string }[] = [
  { key: "me", label: "Você" },
  { key: "team", label: "Equipe" },
  { key: "waiting", label: "Aguardando" },
  { key: "bot", label: "Bot/IA" },
  { key: "done", label: "Concluídos" },
]

const channelColors: Record<string, string> = {
  whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200",
  email: "bg-blue-50 text-blue-700 border-blue-200",
  sms: "bg-gray-100 text-gray-600 border-gray-200",
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  activeFilter: InboxFilter
  onFilterChange: (filter: InboxFilter) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  activeFilter,
  onFilterChange,
}: ConversationListProps) {
  const [search, setSearch] = useState("")

  const unreadTotal = conversations.filter((c) => c.unread_count > 0).length

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const name = `${c.contact?.first_name || ""} ${c.contact?.last_name || ""}`.toLowerCase()
    const email = (c.contact?.email || "").toLowerCase()
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())
  })

  function getInitials(c: Conversation): string {
    const first = c.contact?.first_name?.[0] || ""
    const last = c.contact?.last_name?.[0] || ""
    return (first + last).toUpperCase() || "?"
  }

  function getDisplayName(c: Conversation): string {
    const first = c.contact?.first_name || ""
    const last = c.contact?.last_name || ""
    if (first || last) return `${first} ${last}`.trim()
    return c.contact?.email || "Sem nome"
  }

  return (
    <div className="flex h-full w-80 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
          {unreadTotal > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-medium text-white">
              {unreadTotal}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1 overflow-x-auto mb-3">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeFilter === f.key
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MessageSquare size={32} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400 text-center">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 ${
                selectedId === conv.id
                  ? "bg-brand-50"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                {getInitials(conv)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName(conv)}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {conv.last_message_at
                      ? formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: false,
                          locale: ptBR,
                        })
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-500 truncate flex-1">
                    {conv.last_message || "Sem mensagens"}
                  </p>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${channelColors[conv.channel]}`}
                    >
                      {conv.channel === "whatsapp" ? "WA" : conv.channel === "email" ? "Email" : "SMS"}
                    </Badge>
                    {conv.unread_count > 0 && (
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
