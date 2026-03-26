"use client"

import { MetricCard } from "@/components/dashboard/metric-card"
import { Mail, Eye, MousePointerClick, Users, Zap } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Link from "next/link"
import { format, subDays } from "date-fns"

const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "dd/MM"),
  value: Math.floor(Math.random() * 51),
}))

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral da sua conta</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Emails Enviados" icon={Mail} value="0" />
        <MetricCard label="Taxa de Abertura" icon={Eye} value="0%" />
        <MetricCard label="Taxa de Clique" icon={MousePointerClick} value="0%" />
        <MetricCard label="Contatos Ativos" icon={Users} value="0" />
        <MetricCard label="Flows Ativos" icon={Zap} value="0" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Emails Enviados</h2>
          <p className="text-sm text-gray-500">Últimos 30 dias</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Campanhas Recentes</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg text-gray-600">Nenhuma campanha enviada</p>
          <p className="mt-1 text-sm text-gray-400">Crie sua primeira campanha de email</p>
          <Link
            href="/campaigns/new"
            className="mt-4 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Criar Campanha
          </Link>
        </div>
      </div>
    </div>
  )
}
