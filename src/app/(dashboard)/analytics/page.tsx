"use client"

import { useState } from "react"
import {
  DollarSign,
  Mail,
  Eye,
  MousePointerClick,
  BarChart3,
  Zap,
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

type Period = "7d" | "30d" | "90d"

const periodLabels: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
}

const emailsData: { day: string; sent: number; opened: number; clicked: number }[] = []
const revenueData: { week: string; revenue: number }[] = []
const topCampaigns: {
  id: string
  name: string
  sent: number
  open_rate: number
  click_rate: number
  revenue: number
}[] = []
const topFlows: {
  id: string
  name: string
  trigger_type: string
  entered: number
  emails_sent: number
  revenue: number
}[] = []

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Desempenho dos seus envios nos últimos {periodLabels[period]}
          </p>
        </div>

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
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue Atribuído"
          value="R$ 0,00"
          icon={DollarSign}
        />
        <MetricCard
          label="Emails Enviados"
          value="0"
          icon={Mail}
        />
        <MetricCard
          label="Taxa Abertura Média"
          value="0%"
          icon={Eye}
        />
        <MetricCard
          label="Taxa Clique Média"
          value="0%"
          icon={MousePointerClick}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emails per Day - Area Chart */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Emails por Dia
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Enviados, abertos e clicados
          </p>
          {emailsData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emailsData}>
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
                    stroke="#22C55E"
                    fill="#F0FDF4"
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
            <div className="flex flex-col items-center justify-center h-72">
              <Mail size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Nenhum dado disponível ainda
              </p>
            </div>
          )}
        </div>

        {/* Revenue per Week - Bar Chart */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Revenue por Semana
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Receita atribuída aos envios
          </p>
          {revenueData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#F97316"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72">
              <DollarSign size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Nenhum dado disponível ainda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Campanhas
          </h2>
          {topCampaigns.length > 0 ? (
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
                      <td className="py-2.5 pr-4 text-gray-900 font-medium">
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
                        R$ {campaign.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Nenhuma campanha enviada ainda
              </p>
            </div>
          )}
        </div>

        {/* Top Flows */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Automações
          </h2>
          {topFlows.length > 0 ? (
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
                      <td className="py-2.5 pr-4 text-gray-900 font-medium">
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
                        R$ {flow.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Zap size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Nenhuma automação ativa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
