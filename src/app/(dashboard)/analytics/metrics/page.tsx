"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  BarChart3,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"

type Period = "7d" | "30d" | "90d"
type Channel = "all" | "email" | "whatsapp" | "sms"
type StatusFilter = "all" | "sent" | "draft" | "scheduled"
type SortField =
  | "name"
  | "date"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "unsubscribed"
  | "revenue"
type SortDir = "asc" | "desc"

interface CampaignRow {
  id: string
  name: string
  date: string
  status: string
  channel: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  revenue: number
}

const navTabs = [
  { label: "Overview", href: "/analytics" },
  { label: "Entregabilidade", href: "/analytics/deliverability" },
  { label: "Metricas", href: "/analytics/metrics" },
  { label: "Relatorios", href: "/analytics/reports" },
]

const periodDays: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

export default function MetricsPage() {
  const pathname = usePathname()
  const { store, loading: storeLoading } = useStore()

  const [period, setPeriod] = useState<Period>("30d")
  const [channel, setChannel] = useState<Channel>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  useEffect(() => {
    if (!store) return

    let cancelled = false
    setDataLoading(true)

    async function fetchCampaigns() {
      const supabase = createClient()
      const since = new Date()
      since.setDate(since.getDate() - periodDays[period])

      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("id, name, status, channel, sent_at, created_at")
        .eq("store_id", store!.id)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (!campaignData || campaignData.length === 0) {
        setCampaigns([])
        setDataLoading(false)
        return
      }

      const rows: CampaignRow[] = []

      for (const c of campaignData) {
        const { data: sends } = await supabase
          .from("email_sends")
          .select("status, opened_at, clicked_at")
          .eq("campaign_id", c.id)

        if (cancelled) return

        const total = sends?.length ?? 0
        const delivered =
          sends?.filter(
            (s) =>
              s.status === "delivered" ||
              s.status === "sent" ||
              s.status === "opened" ||
              s.status === "clicked"
          ).length ?? 0
        const opened = sends?.filter((s) => s.opened_at !== null).length ?? 0
        const clicked = sends?.filter((s) => s.clicked_at !== null).length ?? 0
        const bounced =
          sends?.filter((s) => s.status === "bounced").length ?? 0
        const unsubscribed =
          sends?.filter((s) => s.status === "unsubscribed").length ?? 0

        rows.push({
          id: c.id,
          name: c.name,
          date: c.sent_at ?? c.created_at,
          status: c.status,
          channel: c.channel ?? "email",
          sent: total,
          delivered,
          opened,
          clicked,
          bounced,
          unsubscribed,
          revenue: 0,
        })
      }

      if (!cancelled) {
        setCampaigns(rows)
        setDataLoading(false)
      }
    }

    fetchCampaigns()

    return () => {
      cancelled = true
    }
  }, [store, period])

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns

    if (channel !== "all") {
      filtered = filtered.filter((c) => c.channel === channel)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDir === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA)
      }

      const numA = fieldA as number
      const numB = fieldB as number
      return sortDir === "asc" ? numA - numB : numB - numA
    })

    return sorted
  }, [campaigns, channel, statusFilter, sortField, sortDir])

  const totals = useMemo(() => {
    return filteredCampaigns.reduce(
      (acc, c) => ({
        sent: acc.sent + c.sent,
        delivered: acc.delivered + c.delivered,
        opened: acc.opened + c.opened,
        clicked: acc.clicked + c.clicked,
        bounced: acc.bounced + c.bounced,
        unsubscribed: acc.unsubscribed + c.unsubscribed,
        revenue: acc.revenue + c.revenue,
      }),
      {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        revenue: 0,
      }
    )
  }, [filteredCampaigns])

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
      } else {
        setSortField(field)
        setSortDir("desc")
      }
    },
    [sortField]
  )

  const exportCSV = useCallback(() => {
    const headers = [
      "Nome",
      "Data",
      "Enviados",
      "Entregues",
      "Abertos",
      "Clicados",
      "Bounced",
      "Unsubscribed",
      "Revenue (R$)",
    ]

    const rows = filteredCampaigns.map((c) => [
      c.name,
      format(new Date(c.date), "dd/MM/yyyy"),
      c.sent,
      c.delivered,
      c.opened,
      c.clicked,
      c.bounced,
      c.unsubscribed,
      c.revenue.toFixed(2),
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `metricas-campanhas-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [filteredCampaigns])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-400" />
    return sortDir === "asc" ? (
      <ArrowUp size={14} className="text-brand-600" />
    ) : (
      <ArrowDown size={14} className="text-brand-600" />
    )
  }

  const loading = storeLoading || dataLoading

  const formatPercent = (value: number, total: number): string => {
    if (total === 0) return "0%"
    return `${((value / total) * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Nav Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {navTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              pathname === tab.href
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Metricas Detalhadas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Desempenho completo de todas as campanhas
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filteredCampaigns.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Period */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Channel */}
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as Channel)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="all">Todos os canais</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="all">Todos os status</option>
          <option value="sent">Enviados</option>
          <option value="draft">Rascunho</option>
          <option value="scheduled">Agendado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th
                    className="text-left py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Nome <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Data <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("sent")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Enviados <SortIcon field="sent" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("delivered")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Entregues <SortIcon field="delivered" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("opened")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Abertos <SortIcon field="opened" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("clicked")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Clicados <SortIcon field="clicked" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("bounced")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Bounced <SortIcon field="bounced" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("unsubscribed")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Unsub <SortIcon field="unsubscribed" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("revenue")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Revenue <SortIcon field="revenue" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-2.5 px-4 text-gray-900 font-medium">
                      {c.name}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">
                      {format(new Date(c.date), "dd/MM/yyyy")}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {c.sent.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {c.delivered.toLocaleString("pt-BR")}{" "}
                      <span className="text-xs text-gray-400">
                        ({formatPercent(c.delivered, c.sent)})
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {c.opened.toLocaleString("pt-BR")}{" "}
                      <span className="text-xs text-gray-400">
                        ({formatPercent(c.opened, c.delivered)})
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {c.clicked.toLocaleString("pt-BR")}{" "}
                      <span className="text-xs text-gray-400">
                        ({formatPercent(c.clicked, c.delivered)})
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {c.bounced.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {c.unsubscribed.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      R${" "}
                      {c.revenue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                  <td className="py-3 px-4 text-gray-900">Total</td>
                  <td className="py-3 px-4" />
                  <td className="py-3 px-4 text-right text-gray-900">
                    {totals.sent.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {totals.delivered.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {totals.opened.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {totals.clicked.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {totals.bounced.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {totals.unsubscribed.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    R${" "}
                    {totals.revenue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <BarChart3 size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Nenhuma campanha encontrada
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ajuste os filtros ou envie sua primeira campanha
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
