"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DollarSign,
  Mail,
  Eye,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  TrendingUp,
  BarChart3,
  Zap,
  MessageSquare,
  Smartphone,
  Calendar,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/hooks/use-store"
import type {
  DashboardMetrics,
  DayMetric,
  TopCampaign,
  TopFlow,
} from "@/lib/analytics/metrics"

type Period = "7d" | "30d" | "90d" | "custom"

const periodDays: Record<Exclude<Period, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

const tabs = [
  { label: "Overview", href: "/analytics" },
  { label: "Entregabilidade", href: "/analytics/deliverability" },
  { label: "Métricas", href: "/analytics/metrics" },
  { label: "Relatórios", href: "/analytics/reports" },
]

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getDaysFromCustomRange(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 1)
}

export default function AnalyticsPage() {
  const pathname = usePathname()
  const [period, setPeriod] = useState<Period>("30d")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const { store, loading: storeLoading } = useStore()

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [emailsData, setEmailsData] = useState<DayMetric[]>([])
  const [revenueData, setRevenueData] = useState<{ week: string; revenue: number }[]>([])
  const [topCampaigns, setTopCampaigns] = useState<TopCampaign[]>([])
  const [topFlows, setTopFlows] = useState<TopFlow[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const activeDays =
    period === "custom"
      ? customStartDate && customEndDate
        ? getDaysFromCustomRange(customStartDate, customEndDate)
        : 30
      : periodDays[period]

  useEffect(() => {
    if (!store) return
    if (period === "custom" && (!customStartDate || !customEndDate)) return

    let cancelled = false
    setDataLoading(true)

    async function fetchData() {
      const {
        getDashboardMetrics,
        getEmailsOverTime,
        getRevenueAttribution,
        getTopCampaigns,
        getTopFlows,
      } = await import("@/lib/analytics/metrics")

      const [dashMetrics, emails, revenue, campaigns, flows] = await Promise.all([
        getDashboardMetrics(store!.id, activeDays),
        getEmailsOverTime(store!.id, activeDays),
        getRevenueAttribution(store!.id, activeDays),
        getTopCampaigns(store!.id, 5),
        getTopFlows(store!.id, 5),
      ])

      if (cancelled) return

      setMetrics(dashMetrics)
      setEmailsData(emails)
      setRevenueData(revenue)
      setTopCampaigns(campaigns)
      setTopFlows(flows)
      setDataLoading(false)
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [store, period, activeDays, customStartDate, customEndDate])

  const loading = storeLoading || dataLoading

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-0">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Header + Period Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão geral do desempenho dos seus canais de comunicação
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["7d", "30d", "90d"] as Exclude<Period, "custom">[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-white text-orange-600 shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => setPeriod("custom")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                period === "custom"
                  ? "bg-white text-orange-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar size={14} />
              Personalizado
            </button>
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <span className="text-sm text-gray-400">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hero Card - Receita Atribuída */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-orange-50 rounded-lg p-2">
                <DollarSign size={18} className="text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Receita Atribuída</span>
            </div>
            {loading ? (
              <Skeleton className="h-10 w-48 mt-2 rounded" />
            ) : (
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {formatCurrency(totalRevenue || metrics?.total_revenue || 0)}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Nos últimos {activeDays} dias
            </p>
          </div>
          <div className="w-64 h-24">
            {loading ? (
              <Skeleton className="h-full w-full rounded" />
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <Bar
                    dataKey="revenue"
                    fill="#F97316"
                    radius={[3, 3, 0, 0]}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelStyle={{ fontSize: 12, color: "#6B7280" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                Sem dados de receita
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards 2x3 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </>
        ) : (
          <>
            <MetricCard
              label="Open Rate Média"
              value={`${(metrics?.avg_open_rate ?? 0).toFixed(1)}%`}
              icon={Eye}
            />
            <MetricCard
              label="Click Rate Média"
              value={`${(metrics?.avg_click_rate ?? 0).toFixed(1)}%`}
              icon={MousePointerClick}
            />
            <MetricCard
              label="Bounce Rate"
              value="0.0%"
              icon={AlertTriangle}
            />
            <MetricCard
              label="Unsubscribe Rate"
              value="0.0%"
              icon={UserMinus}
            />
            <MetricCard
              label="Emails Enviados"
              value={(metrics?.emails_sent ?? 0).toLocaleString("pt-BR")}
              icon={Mail}
            />
            <MetricCard
              label="Crescimento Contatos"
              value={`+${(metrics?.active_contacts ?? 0).toLocaleString("pt-BR")}`}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Performance de Emails - Area Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Performance de Emails
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Enviados, abertos e clicados por dia
        </p>
        {loading ? (
          <Skeleton className="h-[300px] rounded-lg" />
        ) : emailsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={emailsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="#F97316"
                fill="#FFF7ED"
                strokeWidth={2}
                name="Enviados"
              />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="#10B981"
                fill="#ECFDF5"
                strokeWidth={2}
                name="Abertos"
              />
              <Area
                type="monotone"
                dataKey="clicked"
                stroke="#3B82F6"
                fill="#EFF6FF"
                strokeWidth={2}
                name="Clicados"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Mail size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Nenhum dado de email disponível ainda</p>
            <p className="text-xs text-gray-400 mt-1">Envie sua primeira campanha para ver os dados aqui</p>
          </div>
        )}
      </div>

      {/* Channel Breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Distribuição por Canal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-50 rounded-lg p-2">
                <Mail size={18} className="text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Email</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">100%</p>
            <p className="text-xs text-gray-500 mt-1">dos envios totais</p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-50 rounded-lg p-2">
                <MessageSquare size={18} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">WhatsApp</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0%</p>
            <p className="text-xs text-gray-500 mt-1">dos envios totais</p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-50 rounded-lg p-2">
                <Smartphone size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">SMS</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0%</p>
            <p className="text-xs text-gray-500 mt-1">dos envios totais</p>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Campaigns by Open Rate */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Campanhas por Open Rate
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
            </div>
          ) : topCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">
                      Nome
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">
                      Enviados
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">
                      Open Rate
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">
                      Click Rate
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2.5 pr-4 text-gray-900 font-medium truncate max-w-[160px]">
                        {campaign.name}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {campaign.sent.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {campaign.open_rate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {campaign.click_rate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 pl-4 text-right text-gray-600">
                        {formatCurrency(campaign.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Nenhuma campanha enviada ainda</p>
              <p className="text-xs text-gray-400 mt-1">
                Crie e envie uma campanha para ver os resultados aqui
              </p>
            </div>
          )}
        </div>

        {/* Top 5 Automations by Revenue */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Automações por Revenue
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
            </div>
          ) : topFlows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">
                      Nome
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-gray-500">
                      Trigger
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">
                      Entradas
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">
                      Emails
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topFlows.map((flow) => (
                    <tr
                      key={flow.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2.5 pr-4 text-gray-900 font-medium truncate max-w-[140px]">
                        {flow.name}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">
                        {flow.trigger_type}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {flow.entered.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {flow.emails_sent.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2.5 pl-4 text-right text-gray-600">
                        {formatCurrency(flow.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Zap size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Nenhuma automação ativa</p>
              <p className="text-xs text-gray-400 mt-1">
                Ative uma automação para acompanhar os resultados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
