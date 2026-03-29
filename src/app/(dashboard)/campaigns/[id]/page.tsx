"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Send,
  Check,
  Eye,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  Mail,
  BarChart3,
  ExternalLink,
} from "lucide-react"
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
import { createClient } from "@/lib/supabase/client"

interface CampaignData {
  id: string
  name: string
  subject: string | null
  status: string
  sent_at: string | null
}

interface ReportData {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  timeline: Array<{ hour: string; opens: number; clicks: number }>
  top_links: Array<{ url: string; clicks: number }>
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-yellow-100 text-yellow-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  sending: "Enviando",
  sent: "Enviada",
  failed: "Falhou",
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Fetch campaign info and report in parallel
      const [campaignRes, reportRes] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, name, subject, status, sent_at")
          .eq("id", campaignId)
          .single(),
        fetch(`/api/analytics/campaign/${campaignId}`).then((r) => r.json()),
      ])

      if (campaignRes.data) {
        setCampaign(campaignRes.data as CampaignData)
      } else {
        setCampaign({
          id: campaignId,
          name: "Campanha não encontrada",
          subject: null,
          status: "draft",
          sent_at: null,
        })
      }

      if (reportRes.report) {
        setReport(reportRes.report)
      }

      setLoading(false)
    }

    fetchData()
  }, [campaignId])

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-24 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-20 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-80 animate-pulse" />
      </div>
    )
  }

  if (!campaign) return null

  const r = report ?? {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    open_rate: 0,
    click_rate: 0,
    bounce_rate: 0,
    timeline: [],
    top_links: [],
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/campaigns"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-[18px] w-[18px] mr-1" />
        Voltar para Campanhas
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {campaign.name}
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
              statusStyles[campaign.status] ?? statusStyles.draft
            }`}
          >
            {statusLabels[campaign.status] ?? campaign.status}
          </span>
        </div>
        {campaign.sent_at && (
          <p className="text-sm text-gray-500">
            Enviada em{" "}
            {new Date(campaign.sent_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard
          label="Enviados"
          value={r.sent.toLocaleString("pt-BR")}
          icon={Send}
        />
        <KpiCard
          label="Entregues"
          value={r.delivered.toLocaleString("pt-BR")}
          icon={Check}
        />
        <KpiCard
          label="Abertos"
          value={r.opened.toLocaleString("pt-BR")}
          icon={Eye}
        />
        <KpiCard
          label="Clicados"
          value={r.clicked.toLocaleString("pt-BR")}
          icon={MousePointerClick}
        />
        <KpiCard
          label="Bounced"
          value={r.bounced.toLocaleString("pt-BR")}
          icon={AlertTriangle}
          colorClass={r.bounced > 0 ? "text-red-600" : undefined}
        />
        <KpiCard
          label="Descadastros"
          value={r.unsubscribed.toLocaleString("pt-BR")}
          icon={UserMinus}
        />
      </div>

      {/* Rate row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Open Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {r.open_rate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Click Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {r.click_rate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Bounce Rate</p>
          <p
            className={`text-2xl font-bold ${
              r.bounce_rate > 2 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {r.bounce_rate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Area chart: opens and clicks over 48 hours */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Atividade nas primeiras 48 horas
        </h2>
        {r.timeline.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={r.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  interval="preserveStartEnd"
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
                  dataKey="opens"
                  stroke="#F26B2A"
                  fill="#FED7AA"
                  strokeWidth={2}
                  name="Aberturas"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3B82F6"
                  fill="#BFDBFE"
                  strokeWidth={2}
                  name="Cliques"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Os dados de atividade aparecerão aqui após o envio da campanha
            </p>
          </div>
        )}
      </div>

      {/* Top links table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Links mais clicados
        </h2>
        {r.top_links.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    URL
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Cliques
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.top_links.map((link, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-md">{link.url}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
                      {link.clicks.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Nenhum link clicado ainda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  colorClass?: string
}) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className="h-[18px] w-[18px] text-gray-400" />
      </div>
      <p className={`text-2xl font-semibold ${colorClass ?? "text-gray-900"}`}>
        {value}
      </p>
    </div>
  )
}
