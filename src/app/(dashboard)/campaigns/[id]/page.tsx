"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ArrowLeft, Send, Eye, MousePointerClick, AlertTriangle, UserMinus, CheckCircle } from "lucide-react";

const mockMetrics = {
  total_sent: 2450,
  total_delivered: 2380,
  total_opened: 735,
  total_clicked: 196,
  total_bounced: 70,
  total_unsubscribed: 12,
};

const mockChartData = Array.from({ length: 7 }, (_, i) => ({
  date: `Dia ${i + 1}`,
  abertos: Math.floor(Math.random() * 200) + 50,
  cliques: Math.floor(Math.random() * 50) + 10,
}));

export default function CampaignReportPage() {
  const openRate = ((mockMetrics.total_opened / mockMetrics.total_sent) * 100).toFixed(1);
  const clickRate = ((mockMetrics.total_clicked / mockMetrics.total_sent) * 100).toFixed(1);
  const bounceRate = ((mockMetrics.total_bounced / mockMetrics.total_sent) * 100).toFixed(1);
  const unsubRate = ((mockMetrics.total_unsubscribed / mockMetrics.total_sent) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Newsletter Março</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Enviada</Badge>
          </div>
          <p className="text-sm text-gray-500">Assunto: Novidades do mês | Enviada em 20/03/2026</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <MetricCard icon={Send} label="Enviados" value={mockMetrics.total_sent.toLocaleString("pt-BR")} />
        <MetricCard icon={CheckCircle} label="Entregues" value={mockMetrics.total_delivered.toLocaleString("pt-BR")} />
        <MetricCard icon={Eye} label="Abertos" value={`${openRate}%`} />
        <MetricCard icon={MousePointerClick} label="Clicados" value={`${clickRate}%`} />
        <MetricCard icon={AlertTriangle} label="Bounced" value={`${bounceRate}%`} />
        <MetricCard icon={UserMinus} label="Descadastrados" value={`${unsubRate}%`} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Engajamento ao longo do tempo</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
            <Tooltip />
            <Area type="monotone" dataKey="abertos" stroke="#F97316" fill="#FFF7ED" strokeWidth={2} name="Abertos" />
            <Area type="monotone" dataKey="cliques" stroke="#3B82F6" fill="#EFF6FF" strokeWidth={2} name="Cliques" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
