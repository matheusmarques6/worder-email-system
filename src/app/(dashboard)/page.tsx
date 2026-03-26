"use client";

import { Mail, Eye, MousePointerClick, Users, Zap } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const chartData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  emails: Math.floor(Math.random() * 200 + 50),
}));

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          label="Emails Enviados"
          value="0"
          icon={Mail}
        />
        <MetricCard
          label="Taxa Abertura"
          value="0%"
          icon={Eye}
        />
        <MetricCard
          label="Taxa Clique"
          value="0%"
          icon={MousePointerClick}
        />
        <MetricCard
          label="Contatos Ativos"
          value="0"
          icon={Users}
        />
        <MetricCard
          label="Flows Ativos"
          value="0"
          icon={Zap}
        />
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Emails Enviados
        </h2>
        <p className="text-sm text-gray-500 mb-4">Últimos 30 dias</p>
        <div className="h-[300px]">
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
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="emails"
                stroke="#F97316"
                fill="#FFF7ED"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Campaigns - Empty State */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campanhas Recentes
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Mail size={48} className="text-gray-400" />
          </div>
          <p className="text-lg text-gray-600 mb-1">
            Nenhuma campanha enviada
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Crie sua primeira campanha de email agora
          </p>
          <Link
            href="/campaigns/new"
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Criar Campanha
          </Link>
        </div>
      </div>
    </div>
  );
}
