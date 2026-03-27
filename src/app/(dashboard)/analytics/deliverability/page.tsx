"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Check,
  AlertTriangle,
  AlertOctagon,
  Mail,
  Shield,
  ShieldCheck,
  UserX,
  BarChart3,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/hooks/use-store"
import type { DashboardMetrics } from "@/lib/analytics/metrics"

interface SendingDomain {
  domain: string
  status: "verified" | "pending"
  emailsSent: number
  bounceRate: number
  complaintRate: number
}

interface DeliverabilityDay {
  day: string
  score: number
  deliveryRate: number
}

const navTabs = [
  { label: "Overview", href: "/analytics" },
  { label: "Entregabilidade", href: "/analytics/deliverability" },
  { label: "Metricas", href: "/analytics/metrics" },
  { label: "Relatorios", href: "/analytics/reports" },
]

export default function DeliverabilityPage() {
  const pathname = usePathname()
  const { store, loading: storeLoading } = useStore()

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [domains, setDomains] = useState<SendingDomain[]>([])
  const [chartData, setChartData] = useState<DeliverabilityDay[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Derived metrics
  const totalSent = metrics?.emails_sent ?? 0
  const bounceRate = 0
  const complaintRate = 0
  const deliveryRate = totalSent > 0 ? 100 - bounceRate : 0
  const inboxPlacement = totalSent > 0 ? Math.max(0, deliveryRate - 2) : 0
  const deliverabilityScore = Math.max(
    0,
    Math.round(100 - bounceRate * 10 - complaintRate * 50)
  )

  const scoreColor =
    deliverabilityScore > 80
      ? "text-emerald-600"
      : deliverabilityScore > 60
        ? "text-amber-500"
        : "text-red-500"

  useEffect(() => {
    if (!store) return

    let cancelled = false
    setDataLoading(true)

    async function fetchData() {
      const { getDashboardMetrics } = await import("@/lib/analytics/metrics")

      const dashMetrics = await getDashboardMetrics(store!.id, 30)

      if (cancelled) return

      setMetrics(dashMetrics)
      setDomains([])
      setChartData([])
      setDataLoading(false)
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [store])

  const loading = storeLoading || dataLoading

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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Entregabilidade
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitore a saude dos seus envios de email
        </p>
      </div>

      {/* Deliverability Score Gauge */}
      {loading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Score de Entregabilidade
          </h2>
          <p className={`text-5xl font-bold ${scoreColor}`}>
            {deliverabilityScore}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Baseado em bounce rate e complaint rate
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </>
        ) : (
          <>
            <MetricCard
              label="Entregues"
              value={`${deliveryRate.toFixed(1)}%`}
              icon={Check}
            />
            <MetricCard
              label="Bounced"
              value={`${bounceRate.toFixed(1)}%`}
              icon={AlertTriangle}
            />
            <MetricCard
              label="Complaints"
              value={`${complaintRate.toFixed(2)}%`}
              icon={AlertOctagon}
            />
            <MetricCard
              label="Inbox Placement"
              value={`${inboxPlacement.toFixed(1)}%`}
              icon={Mail}
            />
          </>
        )}
      </div>

      {/* Sending Domains Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dominios de Envio
        </h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
            <Skeleton className="h-8 rounded" />
          </div>
        ) : domains.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">
                    Dominio
                  </th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">
                    Emails Enviados
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">
                    Bounce Rate
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-gray-500">
                    Complaint Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr
                    key={domain.domain}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-gray-900 font-medium">
                      {domain.domain}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          domain.status === "verified"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {domain.status === "verified"
                          ? "Verificado"
                          : "Pendente"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {domain.emailsSent.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {domain.bounceRate.toFixed(2)}%
                    </td>
                    <td className="py-2.5 pl-4 text-right text-gray-600">
                      {domain.complaintRate.toFixed(3)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Mail size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Nenhum dominio configurado
            </p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recomendacoes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-50 rounded-lg p-2">
                <Shield size={18} className="text-brand-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Verificar SPF/DKIM
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Configure os registros SPF e DKIM no seu DNS para autenticar seus
              envios e melhorar a entregabilidade.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-50 rounded-lg p-2">
                <ShieldCheck size={18} className="text-brand-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Configurar DMARC
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Adicione uma politica DMARC ao seu dominio para proteger contra
              spoofing e melhorar a reputacao.
            </p>
          </div>

          {bounceRate > 2 && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-brand-50 rounded-lg p-2">
                  <UserX size={18} className="text-brand-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Limpar Lista
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                Sua bounce rate esta acima de 2%. Remova contatos invalidos para
                manter uma boa reputacao de envio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deliverability Over Time Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Entregabilidade ao longo do tempo
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Score de entregabilidade diario
        </p>
        {loading ? (
          <Skeleton className="h-72 rounded-lg" />
        ) : chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={false}
                  name="Score"
                />
                <Line
                  type="monotone"
                  dataKey="deliveryRate"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  name="Taxa de Entrega"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-72">
            <BarChart3 size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Nenhum dado disponivel ainda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
