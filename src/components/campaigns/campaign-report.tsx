"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
  Users,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface CampaignReportProps {
  campaign: {
    id: string
    name: string
    subject: string | null
    subject_b?: string | null
    status: string
    sent_at: string | null
    ab_test_enabled?: boolean
    stats: {
      sent: number
      opened: number
      clicked: number
      bounced: number
      unsubscribed?: number
      revenue?: number
    } | null
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    scheduled: "bg-yellow-100 text-yellow-700",
    sending: "bg-blue-100 text-blue-700",
    sent: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  }

  const labels: Record<string, string> = {
    draft: "Rascunho",
    scheduled: "Agendada",
    sending: "Enviando",
    sent: "Enviada",
    failed: "Falhou",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${styles[status] ?? styles.draft}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  colorClass,
}: {
  label: string
  value: string | number
  subValue?: string
  icon: React.ComponentType<{ className?: string }>
  colorClass?: string
}) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className="h-[18px] w-[18px] text-gray-400" />
      </div>
      <p className={`text-2xl font-semibold ${colorClass ?? "text-gray-900"}`}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-gray-500 mt-1">{subValue}</p>
      )}
    </div>
  )
}

export function CampaignReport({ campaign }: CampaignReportProps) {
  const stats = campaign.stats ?? {
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    revenue: 0,
  }

  const delivered = stats.sent - stats.bounced
  const openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0
  const clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0
  const bounceRate = stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0
  const unsubscribed = stats.unsubscribed ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-[18px] w-[18px] mr-1" />
          Voltar
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {campaign.name}
          </h1>
          <StatusBadge status={campaign.status} />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {campaign.sent_at && (
            <span>
              Enviada em{" "}
              {format(new Date(campaign.sent_at), "dd MMM yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </span>
          )}
          {campaign.subject && (
            <span className="flex items-center gap-1">
              <Mail className="h-[18px] w-[18px]" />
              {campaign.subject}
            </span>
          )}
        </div>
      </div>

      {/* Metric Cards - 2 rows x 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Enviados"
          value={stats.sent.toLocaleString("pt-BR")}
          icon={Send}
        />
        <MetricCard
          label="Entregues"
          value={delivered.toLocaleString("pt-BR")}
          subValue={
            stats.sent > 0
              ? `${((delivered / stats.sent) * 100).toFixed(1)}% de entrega`
              : undefined
          }
          icon={Check}
        />
        <MetricCard
          label="Taxa Abertura"
          value={`${openRate.toFixed(1)}%`}
          subValue={`${stats.opened.toLocaleString("pt-BR")} aberturas`}
          icon={Eye}
          colorClass={openRate > 20 ? "text-emerald-600" : "text-amber-600"}
        />
        <MetricCard
          label="Taxa Clique"
          value={`${clickRate.toFixed(1)}%`}
          subValue={`${stats.clicked.toLocaleString("pt-BR")} cliques`}
          icon={MousePointerClick}
        />
        <MetricCard
          label="Rejeitados"
          value={stats.bounced.toLocaleString("pt-BR")}
          subValue={`${bounceRate.toFixed(1)}%`}
          icon={AlertTriangle}
          colorClass={bounceRate > 2 ? "text-red-600" : undefined}
        />
        <MetricCard
          label="Descadastros"
          value={unsubscribed.toLocaleString("pt-BR")}
          icon={UserMinus}
        />
      </div>

      {/* A/B Test Comparison */}
      {campaign.ab_test_enabled && campaign.subject_b && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Teste A/B
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Variante A
                </span>
                {openRate >= 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                    Winner
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">{campaign.subject}</p>
              <p className="text-sm text-gray-900">
                Taxa de abertura: {openRate.toFixed(1)}%
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Variante B
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {campaign.subject_b}
              </p>
              <p className="text-sm text-gray-900">
                Taxa de abertura: --
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activity Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Atividade ao longo do tempo
        </h2>
        {stats.sent > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="opens"
                stroke="#F97316"
                fill="#FED7AA"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#3B82F6"
                fill="#BFDBFE"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Os dados de atividade aparecerão aqui após o envio da campanha
            </p>
          </div>
        )}
      </div>

      {/* Recipients Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Destinatários
        </h2>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Nenhum destinatário encontrado
          </p>
          <p className="text-sm text-gray-500">
            Os destinatários aparecerão aqui após o envio da campanha
          </p>
        </div>
      </div>
    </div>
  )
}
