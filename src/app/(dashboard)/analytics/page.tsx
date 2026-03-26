"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Send, Eye, MousePointerClick, Users, Zap } from "lucide-react";

const periods = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

const mockEmailData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    emails: Math.floor(Math.random() * 500) + 100,
    openRate: Math.floor(Math.random() * 20) + 20,
  };
});

const topCampaigns = [
  { name: "Newsletter Março", sent: 2450, openRate: 30 },
  { name: "Promoção Páscoa", sent: 1820, openRate: 27 },
  { name: "Welcome Series", sent: 1250, openRate: 52 },
  { name: "Reengajamento", sent: 980, openRate: 21 },
  { name: "Black Friday Early", sent: 3200, openRate: 35 },
];

const topFlows = [
  { name: "Welcome Series", entered: 1250, completed: 980 },
  { name: "Carrinho Abandonado", entered: 845, completed: 320 },
  { name: "Pós-Compra", entered: 620, completed: 450 },
  { name: "Win-back", entered: 340, completed: 120 },
  { name: "Boleto Pendente", entered: 280, completed: 195 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe o desempenho dos seus envios</p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                period === p.value
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={Send} label="Emails Enviados" value="12.458" change={12.5} />
        <MetricCard icon={Eye} label="Taxa Abertura" value="28.4%" change={3.2} />
        <MetricCard icon={MousePointerClick} label="Taxa Clique" value="4.7%" change={-1.1} />
        <MetricCard icon={Users} label="Contatos Ativos" value="3.842" change={8.3} />
        <MetricCard icon={Zap} label="Flows Ativos" value="7" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Emails por dia</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockEmailData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
            <Tooltip />
            <Area type="monotone" dataKey="emails" stroke="#F97316" fill="#FFF7ED" strokeWidth={2} name="Emails" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Campanhas</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Campanha</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Enviados</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Open Rate</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.map((c) => (
                <tr key={c.name} className="border-b border-gray-100">
                  <td className="px-6 py-3 text-sm text-gray-900">{c.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{c.sent.toLocaleString("pt-BR")}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{c.openRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Automações</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Automação</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entradas</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Completados</th>
              </tr>
            </thead>
            <tbody>
              {topFlows.map((f) => (
                <tr key={f.name} className="border-b border-gray-100">
                  <td className="px-6 py-3 text-sm text-gray-900">{f.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{f.entered.toLocaleString("pt-BR")}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{f.completed.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
