"use client"

import { useEffect, useState, useCallback } from "react"
import { Mail, Eye, MousePointerClick, Users, Zap, DollarSign, Upload, Plus } from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { MetricCard } from "@/components/dashboard/metric-card"
import { useStore } from "@/hooks/use-store"

interface DashboardMetrics {
  emails_sent: number
  avg_open_rate: number
  avg_click_rate: number
  active_contacts: number
  live_flows: number
  total_revenue: number
}

interface DayMetric {
  day: string
  sent: number
  opened: number
  clicked: number
}

interface TopCampaign {
  id: string
  name: string
  sent: number
  open_rate: number
  click_rate: number
  revenue: number
}

type Period = 7 | 30 | 90

const periodOptions: { value: Period; label: string }[] = [
  { value: 7, label: "Últimos 7 dias" },
  { value: 30, label: "Últimos 30 dias" },
  { value: 90, label: "Últimos 90 dias" },
]

export default function DashboardPage() {
  const { store, loading: storeLoading } = useStore()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    emails_sent: 0,
    avg_open_rate: 0,
    avg_click_rate: 0,
    active_contacts: 0,
    live_flows: 0,
    total_revenue: 0,
  })
  const [chartData, setChartData] = useState<DayMetric[]>([])
  const [topCampaigns, setTopCampaigns] = useState<TopCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>(30)

  const fetchData = useCallback(async (storeId: string, days: Period) => {
    setLoading(true)
    try {
      const { getDashboardMetrics, getEmailsOverTime, getTopCampaigns } = await import(
        "@/lib/analytics/metrics"
      )
      const [m, chart, campaigns] = await Promise.all([
        getDashboardMetrics(storeId, days),
        getEmailsOverTime(storeId, days),
        getTopCampaigns(storeId, 5),
      ])
      setMetrics(m)
      setChartData(chart)
      setTopCampaigns(campaigns)
    } catch {
      // Analytics not available yet, keep defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!store?.id) {
      setLoading(false)
      return
    }
    fetchData(store.id, period)
  }, [store?.id, period, fetchData])

  function handlePeriodChange(newPeriod: Period) {
    setPeriod(newPeriod)
  }

  // Loading skeleton
  if (storeLoading || (loading && !store)) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-28 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-80 animate-pulse" />
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-48 animate-pulse" />
      </div>
    )
  }

  // Empty state when no emails sent
  const isEmpty = metrics.emails_sent === 0

  return (
    <div className="space-y-6">
      {/* Header with greeting and period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Olá, {store?.name ?? "Minha Loja"}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral da sua conta</p>
        </div>
        <select
          value={period}
          onChange={(e) => handlePeriodChange(Number(e.target.value) as Period)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Revenue Atribuído"
          value={`R$ ${metrics.total_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Emails Enviados"
          value={metrics.emails_sent.toLocaleString("pt-BR")}
          icon={Mail}
        />
        <MetricCard
          label="Taxa Abertura"
          value={`${metrics.avg_open_rate.toFixed(1)}%`}
          icon={Eye}
        />
        <MetricCard
          label="Taxa Clique"
          value={`${metrics.avg_click_rate.toFixed(1)}%`}
          icon={MousePointerClick}
        />
        <MetricCard
          label="Contatos Ativos"
          value={metrics.active_contacts.toLocaleString("pt-BR")}
          icon={Users}
        />
        <MetricCard
          label="Flows Ativos"
          value={String(metrics.live_flows)}
          icon={Zap}
        />
      </div>

      {/* Empty state CTA */}
      {isEmpty && (
        <div className="bg-gradient-to-r from-[#F26B2A]/5 to-[#F5A623]/5 border border-brand-200 rounded-lg p-8 text-center">
          <Mail size={48} className="text-brand-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Envie sua primeira campanha
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Comece enviando um email para seus contatos e acompanhe os resultados aqui no dashboard.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
          >
            <Plus size={18} />
            Criar Campanha
          </Link>
        </div>
      )}

      {/* Area chart: Emails Enviados */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Emails Enviados
            </h2>
            <p className="text-sm text-gray-500">
              {periodOptions.find((p) => p.value === period)?.label}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="h-72 bg-gray-50 rounded animate-pulse" />
        ) : chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#F26B2A"
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail size={40} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Nenhum dado disponível ainda
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/campaigns/new"
            className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 hover:border-brand-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 rounded-lg p-2 group-hover:bg-brand-100 transition-colors">
                <Mail size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Criar Campanha</p>
                <p className="text-xs text-gray-500">Envie um email para sua base</p>
              </div>
            </div>
          </Link>
          <Link
            href="/flows/new"
            className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 hover:border-brand-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 rounded-lg p-2 group-hover:bg-brand-100 transition-colors">
                <Zap size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Criar Automação</p>
                <p className="text-xs text-gray-500">Configure um flow automático</p>
              </div>
            </div>
          </Link>
          <Link
            href="/audience/profiles"
            className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 hover:border-brand-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 rounded-lg p-2 group-hover:bg-brand-100 transition-colors">
                <Upload size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Importar Contatos</p>
                <p className="text-xs text-gray-500">Importe sua base de contatos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Top Campanhas table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Campanhas
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : topCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-right">Enviados</th>
                  <th className="px-6 py-3 text-right">Open Rate</th>
                  <th className="px-6 py-3 text-right">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="hover:text-brand-600"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {c.sent.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {c.open_rate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {c.click_rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Mail size={48} className="text-gray-300 mb-4" />
            <p className="text-lg text-gray-600 mb-1">
              Nenhuma campanha enviada
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Crie sua primeira campanha de email
            </p>
            <Link
              href="/campaigns/new"
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Criar Campanha
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
