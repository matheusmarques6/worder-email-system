"use client"

import { useEffect, useState } from "react"
import { Mail, Eye, MousePointerClick, Users, Zap, DollarSign, Plus, Upload } from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

  useEffect(() => {
    if (!store?.id) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        const { getDashboardMetrics, getEmailsOverTime, getTopCampaigns } = await import(
          "@/lib/analytics/metrics"
        )
        const [m, chart, campaigns] = await Promise.all([
          getDashboardMetrics(store!.id, 30),
          getEmailsOverTime(store!.id, 30),
          getTopCampaigns(store!.id, 5),
        ])
        setMetrics(m)
        setChartData(chart)
        setTopCampaigns(campaigns)
      } catch {
        // Analytics not available yet, keep defaults
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [store])

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-28 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral</p>
      </div>

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

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Emails Enviados
        </h2>
        <p className="text-sm text-gray-500 mb-4">Últimos 30 dias</p>
        {chartData.length > 0 ? (
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
                <Tooltip />
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

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Campanhas
        </h2>
        {topCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Enviados</th>
                  <th className="px-6 py-3 text-left">Taxa de Abertura</th>
                  <th className="px-6 py-3 text-left">Taxa de Clique</th>
                  <th className="px-6 py-3 text-left">Receita</th>
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
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.sent.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.open_rate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.click_rate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      R$ {c.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
