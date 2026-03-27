"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
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
import {
  ChevronLeft,
  Eye,
  ClipboardCheck,
  TrendingUp,
  Clock,
  ClipboardList,
} from "lucide-react"

interface Submission {
  created_at: string
  email: string
  name: string | null
  phone: string | null
}

interface DayData {
  day: string
  submissions: number
}

export default function FormAnalyticsPage() {
  const params = useParams()
  const formId = params.id as string
  const { store } = useStore()
  const [loading, setLoading] = useState(true)
  const [impressions, setImpressions] = useState(0)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [chartData, setChartData] = useState<DayData[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    if (!store?.id) return
    const supabase = createClient()

    async function fetchAnalytics() {
      // Fetch form for impressions count
      const { data: form } = await supabase
        .from("forms")
        .select("impressions, submissions")
        .eq("id", formId)
        .single()

      if (form) {
        setImpressions((form.impressions as number) ?? 0)
      }

      // Fetch submission events
      const { data: events } = await supabase
        .from("events")
        .select("created_at, properties")
        .eq("store_id", store!.id)
        .eq("type", "form_submission")
        .filter("properties->>form_id", "eq", formId)
        .order("created_at", { ascending: false })

      if (events) {
        const subs: Submission[] = events.map((e) => {
          const props = e.properties as Record<string, unknown>
          return {
            created_at: e.created_at,
            email: (props.email as string) ?? "",
            name: (props.name as string) ?? null,
            phone: (props.phone as string) ?? null,
          }
        })
        setSubmissions(subs)

        // Build chart data
        const dayMap: Record<string, number> = {}
        for (const sub of subs) {
          const day = sub.created_at.split("T")[0]
          dayMap[day] = (dayMap[day] ?? 0) + 1
        }
        const sorted = Object.entries(dayMap)
          .map(([day, count]) => ({ day, submissions: count }))
          .sort((a, b) => a.day.localeCompare(b.day))
        setChartData(sorted)
      }

      setLoading(false)
    }

    fetchAnalytics()
  }, [formId, store?.id])

  const totalSubmissions = submissions.length
  const conversionRate = impressions > 0 ? ((totalSubmissions / impressions) * 100).toFixed(1) : "0.0"
  const lastSubmission = submissions.length > 0 ? new Date(submissions[0].created_at).toLocaleDateString("pt-BR") : "—"
  const paginatedSubs = submissions.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(submissions.length / pageSize)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/forms/${formId}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} /> Voltar ao editor
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">Analytics do Formulário</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Impressões" value={impressions.toLocaleString("pt-BR")} icon={Eye} />
        <MetricCard label="Submissions" value={totalSubmissions.toLocaleString("pt-BR")} icon={ClipboardCheck} />
        <MetricCard label="Taxa de Conversão" value={`${conversionRate}%`} icon={TrendingUp} />
        <MetricCard label="Última Submission" value={lastSubmission} icon={Clock} />
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submissions por Dia</h2>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <Tooltip />
                <Area type="monotone" dataKey="submissions" stroke="#F97316" fill="#FFF7ED" strokeWidth={2} name="Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList size={48} className="text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">Nenhuma submission ainda</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Submissions</h2>
        {submissions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Data</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Nome</th>
                    <th className="px-6 py-3 text-left">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubs.map((sub, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{sub.name ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{sub.phone ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50">
                  Anterior
                </button>
                <span className="text-sm text-gray-500">Página {page + 1} de {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50">
                  Próximo
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList size={48} className="text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">Nenhuma submission ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
