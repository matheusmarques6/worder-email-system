"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  ArrowLeftRight,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { format, subDays } from "date-fns"

interface CampaignOption {
  id: string
  name: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  revenue: number
}

interface GrowthWeek {
  week: string
  newContacts: number
  churn: number
  netGrowth: number
}

const navTabs = [
  { label: "Overview", href: "/analytics" },
  { label: "Entregabilidade", href: "/analytics/deliverability" },
  { label: "Metricas", href: "/analytics/metrics" },
  { label: "Relatorios", href: "/analytics/reports" },
]

export default function ReportsPage() {
  const pathname = usePathname()
  const { store, loading: storeLoading } = useStore()

  const [campaigns, setCampaigns] = useState<CampaignOption[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Monthly report state
  const [showMonthlyReport, setShowMonthlyReport] = useState(false)
  const [monthlyMetrics, setMonthlyMetrics] = useState({
    emailsSent: 0,
    openRate: 0,
    clickRate: 0,
    revenue: 0,
  })

  // Campaign comparison state
  const [campaignA, setCampaignA] = useState("")
  const [campaignB, setCampaignB] = useState("")
  const [showComparison, setShowComparison] = useState(false)

  // Growth report state
  const [showGrowthReport, setShowGrowthReport] = useState(false)
  const [growthData, setGrowthData] = useState<GrowthWeek[]>([])

  useEffect(() => {
    if (!store) return

    let cancelled = false
    setDataLoading(true)

    async function fetchCampaigns() {
      const supabase = createClient()

      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("store_id", store!.id)
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(50)

      if (cancelled) return

      if (!campaignData || campaignData.length === 0) {
        setCampaigns([])
        setDataLoading(false)
        return
      }

      const options: CampaignOption[] = []

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

        options.push({
          id: c.id,
          name: c.name,
          sent: total,
          delivered,
          opened,
          clicked,
          bounced,
          revenue: 0,
        })
      }

      if (!cancelled) {
        setCampaigns(options)
        setDataLoading(false)
      }
    }

    fetchCampaigns()

    return () => {
      cancelled = true
    }
  }, [store])

  useEffect(() => {
    if (!store || !showMonthlyReport) return

    let cancelled = false

    async function fetchMonthlyMetrics() {
      const { getDashboardMetrics } = await import("@/lib/analytics/metrics")
      const metrics = await getDashboardMetrics(store!.id, 30)

      if (cancelled) return

      setMonthlyMetrics({
        emailsSent: metrics.emails_sent,
        openRate: metrics.avg_open_rate,
        clickRate: metrics.avg_click_rate,
        revenue: metrics.total_revenue,
      })
    }

    fetchMonthlyMetrics()

    return () => {
      cancelled = true
    }
  }, [store, showMonthlyReport])

  const campaignAData = campaigns.find((c) => c.id === campaignA)
  const campaignBData = campaigns.find((c) => c.id === campaignB)

  const handleCompare = () => {
    if (campaignA && campaignB) {
      setShowComparison(true)
    }
  }

  const handleGrowthReport = () => {
    // For now, show empty state since no growth data is available
    setShowGrowthReport(true)
    setGrowthData([])
  }

  const loading = storeLoading || dataLoading

  const startDate = format(subDays(new Date(), 30), "dd/MM/yyyy")
  const endDate = format(new Date(), "dd/MM/yyyy")

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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Relatorios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gere relatorios detalhados sobre seus envios e audiencia
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Monthly Report */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-50 rounded-lg p-2">
                <FileText size={18} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Relatorio Mensal
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Metricas consolidadas do ultimo mes
            </p>
            <button
              onClick={() => setShowMonthlyReport(!showMonthlyReport)}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showMonthlyReport ? "Ocultar Relatorio" : "Gerar Relatorio"}
            </button>

            {showMonthlyReport && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <p className="text-xs text-gray-400">
                  Periodo: {startDate} a {endDate}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Emails Enviados</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {monthlyMetrics.emailsSent.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Open Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {monthlyMetrics.openRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Click Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {monthlyMetrics.clickRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">
                      R${" "}
                      {monthlyMetrics.revenue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Campaign Comparison */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-50 rounded-lg p-2">
                <ArrowLeftRight size={18} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Comparacao de Campanhas
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Compare metricas de diferentes campanhas
            </p>

            <div className="space-y-3">
              <select
                value={campaignA}
                onChange={(e) => {
                  setCampaignA(e.target.value)
                  setShowComparison(false)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Selecione Campanha A</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={campaignB}
                onChange={(e) => {
                  setCampaignB(e.target.value)
                  setShowComparison(false)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Selecione Campanha B</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCompare}
                disabled={!campaignA || !campaignB}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comparar
              </button>
            </div>

            {showComparison && campaignAData && campaignBData && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-2 font-medium text-gray-500">
                          Metrica
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">
                          A
                        </th>
                        <th className="text-right py-2 pl-2 font-medium text-gray-500">
                          B
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-700">Enviados</td>
                        <td className="py-1.5 px-2 text-right text-gray-600">
                          {campaignAData.sent.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-600">
                          {campaignBData.sent.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-700">
                          Entregues
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-600">
                          {campaignAData.delivered.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-600">
                          {campaignBData.delivered.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-700">
                          Open Rate
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-600">
                          {formatPercent(
                            campaignAData.opened,
                            campaignAData.delivered
                          )}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-600">
                          {formatPercent(
                            campaignBData.opened,
                            campaignBData.delivered
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-700">
                          Click Rate
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-600">
                          {formatPercent(
                            campaignAData.clicked,
                            campaignAData.delivered
                          )}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-600">
                          {formatPercent(
                            campaignBData.clicked,
                            campaignBData.delivered
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-700">Bounced</td>
                        <td className="py-1.5 px-2 text-right text-gray-600">
                          {campaignAData.bounced.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-600">
                          {campaignBData.bounced.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 text-gray-700">Revenue</td>
                        <td className="py-1.5 px-2 text-right text-gray-600">
                          R${" "}
                          {campaignAData.revenue.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-600">
                          R${" "}
                          {campaignBData.revenue.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showComparison && (!campaignAData || !campaignBData) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center">
                  Selecione duas campanhas para comparar
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Growth Report */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-50 rounded-lg p-2">
                <TrendingUp size={18} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Growth Report
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Crescimento de contatos por semana
            </p>
            <button
              onClick={handleGrowthReport}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showGrowthReport ? "Atualizar Relatorio" : "Gerar Relatorio"}
            </button>

            {showGrowthReport && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {growthData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 pr-2 font-medium text-gray-500">
                            Semana
                          </th>
                          <th className="text-right py-2 px-2 font-medium text-gray-500">
                            Novos
                          </th>
                          <th className="text-right py-2 px-2 font-medium text-gray-500">
                            Churn
                          </th>
                          <th className="text-right py-2 pl-2 font-medium text-gray-500">
                            Net Growth
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthData.map((week) => (
                          <tr
                            key={week.week}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="py-1.5 pr-2 text-gray-700">
                              {week.week}
                            </td>
                            <td className="py-1.5 px-2 text-right text-emerald-600">
                              +{week.newContacts}
                            </td>
                            <td className="py-1.5 px-2 text-right text-red-500">
                              -{week.churn}
                            </td>
                            <td className="py-1.5 pl-2 text-right text-gray-900 font-medium">
                              {week.netGrowth > 0
                                ? `+${week.netGrowth}`
                                : week.netGrowth}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users size={36} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500">
                      Nenhum dado de crescimento disponivel
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Os dados aparecerao conforme novos contatos forem
                      adicionados
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
