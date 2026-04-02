"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  XCircle,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Campaign row type used by the table
interface CampaignRow {
  id: string
  name: string
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed"
  created_at: string
  sent_at: string | null
  stats: {
    sent: number
    opened: number
    clicked: number
    revenue: number
  } | null
}

interface CampaignTableProps {
  campaigns: CampaignRow[]
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

// Status badge configuration
const statusConfig: Record<
  CampaignRow["status"],
  { label: string; classes: string }
> = {
  draft: {
    label: "Rascunho",
    classes: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  scheduled: {
    label: "Agendada",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  sending: {
    label: "Enviando",
    classes: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  sent: {
    label: "Enviada",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  cancelled: {
    label: "Cancelada",
    classes: "bg-red-50 text-red-700 border border-red-200",
  },
  failed: {
    label: "Falhou",
    classes: "bg-red-50 text-red-700 border border-red-200",
  },
}

// Format a number as Brazilian Real currency
function formatRevenue(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Format a ratio as a percentage string
function formatPercent(numerator: number, denominator: number): string {
  if (denominator === 0) return "0.0%"
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

// Simple dropdown component for row actions
function ActionsDropdown({
  campaign,
  onDelete,
  onDuplicate,
}: {
  campaign: CampaignRow
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
        aria-label="Ações"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-sm py-1">
          {/* View report — only for sent campaigns */}
          {campaign.status === "sent" && (
            <Link
              href={`/campaigns/${campaign.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
              onClick={() => setOpen(false)}
            >
              <Eye size={18} className="text-gray-400" />
              Ver relatório
            </Link>
          )}

          {/* Edit — only for draft campaigns */}
          {campaign.status === "draft" && (
            <Link
              href={`/campaigns/${campaign.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
              onClick={() => setOpen(false)}
            >
              <Edit size={18} className="text-gray-400" />
              Editar
            </Link>
          )}

          {/* Duplicate — always available */}
          <button
            onClick={() => {
              onDuplicate(campaign.id)
              setOpen(false)
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            <Copy size={18} className="text-gray-400" />
            Duplicar
          </button>

          {/* Cancel — only for scheduled campaigns */}
          {campaign.status === "scheduled" && (
            <button
              onClick={() => {
                onDelete(campaign.id)
                setOpen(false)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <XCircle size={18} className="text-red-400" />
              Cancelar
            </button>
          )}

          {/* Delete — only for draft campaigns */}
          {campaign.status === "draft" && (
            <button
              onClick={() => {
                onDelete(campaign.id)
                setOpen(false)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <Trash2 size={18} className="text-red-400" />
              Deletar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function CampaignTable({
  campaigns,
  onDelete,
  onDuplicate,
}: CampaignTableProps) {
  const [search, setSearch] = useState("")

  // Filter by search term and sort by date (newest first)
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    const result = campaigns.filter((c) =>
      term ? c.name.toLowerCase().includes(term) : true
    )
    return result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [campaigns, search])

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar campanha..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Data
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Enviados
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Abertos %
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Clicados %
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Receita R$
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    Nenhuma campanha encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((campaign) => {
                  const displayDate = campaign.sent_at ?? campaign.created_at
                  const badge = statusConfig[campaign.status]
                  return (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {campaign.name}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                            badge.classes
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(displayDate), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                      </td>

                      {/* Sent count */}
                      <td className="px-4 py-3 text-right text-gray-600">
                        {campaign.stats
                          ? campaign.stats.sent.toLocaleString("pt-BR")
                          : "—"}
                      </td>

                      {/* Open rate */}
                      <td className="px-4 py-3 text-right text-gray-600">
                        {campaign.stats
                          ? formatPercent(
                              campaign.stats.opened,
                              campaign.stats.sent
                            )
                          : "—"}
                      </td>

                      {/* Click rate */}
                      <td className="px-4 py-3 text-right text-gray-600">
                        {campaign.stats
                          ? formatPercent(
                              campaign.stats.clicked,
                              campaign.stats.sent
                            )
                          : "—"}
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3 text-right text-gray-600">
                        {campaign.stats
                          ? formatRevenue(campaign.stats.revenue)
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <ActionsDropdown
                          campaign={campaign}
                          onDelete={onDelete}
                          onDuplicate={onDuplicate}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export type { CampaignRow }
