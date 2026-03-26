"use client";

import { Mail, MousePointerClick, Users, Zap, Send } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Badge } from "@/components/ui/badge";

const mockChartData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    emails: Math.floor(Math.random() * 500) + 100,
  };
});

const mockCampaigns = [
  {
    id: "1",
    name: "Newsletter Março",
    status: "sent" as const,
    sent_at: "2026-03-20",
    total_sent: 2450,
    total_opened: 735,
    total_clicked: 196,
  },
  {
    id: "2",
    name: "Promoção Páscoa",
    status: "scheduled" as const,
    sent_at: "2026-03-28",
    total_sent: 0,
    total_opened: 0,
    total_clicked: 0,
  },
  {
    id: "3",
    name: "Lançamento Coleção",
    status: "draft" as const,
    sent_at: null,
    total_sent: 0,
    total_opened: 0,
    total_clicked: 0,
  },
  {
    id: "4",
    name: "Reengajamento",
    status: "sent" as const,
    sent_at: "2026-03-15",
    total_sent: 1820,
    total_opened: 491,
    total_clicked: 127,
  },
  {
    id: "5",
    name: "Welcome Series",
    status: "sent" as const,
    sent_at: "2026-03-10",
    total_sent: 342,
    total_opened: 178,
    total_clicked: 89,
  },
];

const statusBadge: Record<string, { label: string; className: string }> = {
  sent: {
    label: "Enviada",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  scheduled: {
    label: "Agendada",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  draft: {
    label: "Rascunho",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  sending: {
    label: "Enviando",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={Send}
          label="Emails Enviados"
          value="12.458"
          change={12.5}
        />
        <MetricCard
          icon={Mail}
          label="Taxa Abertura"
          value="28.4%"
          change={3.2}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Taxa Clique"
          value="4.7%"
          change={-1.1}
        />
        <MetricCard
          icon={Users}
          label="Contatos Ativos"
          value="3.842"
          change={8.3}
        />
        <MetricCard icon={Zap} label="Flows Ativos" value="7" change={0} />
      </div>

      <RevenueChart data={mockChartData} />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Últimas campanhas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Enviados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Abertos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliques
                </th>
              </tr>
            </thead>
            <tbody>
              {mockCampaigns.map((campaign) => {
                const badge = statusBadge[campaign.status];
                return (
                  <tr
                    key={campaign.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={badge.className}
                      >
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {campaign.sent_at
                        ? new Date(campaign.sent_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.total_sent.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.total_sent > 0
                        ? `${((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.total_sent > 0
                        ? `${((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
