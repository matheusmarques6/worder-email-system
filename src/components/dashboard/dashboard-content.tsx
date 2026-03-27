"use client";

import Link from "next/link";
import {
  Mail,
  Eye,
  MousePointerClick,
  Users,
  Zap,
  MessageCircle,
  ArrowRight,
  Plus,
  Upload,
  BarChart3,
  TrendingUp,
  Send,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardContentProps {
  totalContacts: number;
  totalEmailsSent: number;
  activeFlows: number;
  openRate: number;
  clickRate: number;
  chartData: { date: string; emails: number }[];
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    sent_at: string | null;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
  }>;
  activeFlowsList: Array<{
    id: string;
    name: string;
    trigger_type: string;
    total_entered: number;
    total_emails_sent: number;
    status: string;
  }>;
  onboardingComplete: boolean;
  onboardingStep: number;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  sent: {
    label: "Enviada",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  live: {
    label: "Ativa",
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

const triggerLabels: Record<string, string> = {
  welcome: "Boas-vindas",
  abandoned_cart: "Carrinho abandonado",
  post_purchase: "Pós-compra",
  winback: "Reengajamento",
  browse_abandonment: "Navegação abandonada",
};

export function DashboardContent({
  totalContacts,
  totalEmailsSent,
  activeFlows,
  openRate,
  clickRate,
  chartData,
  recentCampaigns,
  activeFlowsList,
  onboardingComplete,
  onboardingStep,
}: DashboardContentProps) {
  const onboardingProgress = Math.round((onboardingStep / 6) * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Onboarding Banner */}
      {!onboardingComplete && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Complete seu setup
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure sua conta para comecar a enviar campanhas e automacoes.
              </p>
              <div className="mt-4 max-w-md">
                <Progress value={onboardingProgress} className="h-2" />
                <p className="mt-2 text-xs text-gray-500">
                  {onboardingStep} de 6 etapas concluidas
                </p>
              </div>
            </div>
            <Link
              href="/onboarding"
              className="ml-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Continuar setup
              <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Revenue Card */}
      <div className="rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">
              Receita Atribuida
            </p>
            <p className="mt-1 text-3xl font-bold">R$ 0,00</p>
            <p className="mt-1 text-xs text-gray-400">Ultimos 30 dias</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
            <TrendingUp className="h-[18px] w-[18px] text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">0%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          icon={Send}
          label="Emails Enviados"
          value={totalEmailsSent.toLocaleString("pt-BR")}
        />
        <MetricCard
          icon={Eye}
          label="Taxa Abertura"
          value={`${openRate}%`}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Taxa Clique"
          value={`${clickRate}%`}
        />
        <MetricCard
          icon={Users}
          label="Contatos Ativos"
          value={totalContacts.toLocaleString("pt-BR")}
        />
        <MetricCard
          icon={Zap}
          label="Flows Ativos"
          value={activeFlows.toLocaleString("pt-BR")}
        />
        <MetricCard
          icon={MessageCircle}
          label="WhatsApp Enviados"
          value="0"
        />
      </div>

      {/* Performance Chart */}
      <RevenueChart data={chartData} />

      {/* Two-column grid: Recent Campaigns + Active Flows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Campaigns */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Campanhas Recentes
            </h2>
            <Link
              href="/campaigns"
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Ver todas
            </Link>
          </div>
          {recentCampaigns.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentCampaigns.map((campaign) => {
                const badge = statusBadge[campaign.status] || statusBadge.draft;
                return (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {campaign.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.sent_at
                          ? new Date(campaign.sent_at).toLocaleDateString("pt-BR")
                          : "Sem data"}
                        {campaign.total_sent > 0 &&
                          ` \u00B7 ${campaign.total_sent.toLocaleString("pt-BR")} enviados`}
                      </p>
                    </div>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12">
              <Mail className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-900">
                Nenhuma campanha ainda
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Crie sua primeira campanha de email.
              </p>
              <Link
                href="/campaigns/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Plus className="h-[18px] w-[18px]" />
                Criar Campanha
              </Link>
            </div>
          )}
        </div>

        {/* Active Flows */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Automacoes Ativas
            </h2>
            <Link
              href="/flows"
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Ver todas
            </Link>
          </div>
          {activeFlowsList.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {activeFlowsList.map((flow) => {
                const badge = statusBadge[flow.status] || statusBadge.draft;
                return (
                  <div
                    key={flow.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {flow.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {triggerLabels[flow.trigger_type] || flow.trigger_type}
                        {" \u00B7 "}
                        {flow.total_entered.toLocaleString("pt-BR")} entraram
                        {" \u00B7 "}
                        {flow.total_emails_sent.toLocaleString("pt-BR")} emails
                      </p>
                    </div>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12">
              <Zap className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-900">
                Nenhuma automacao ativa
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Crie fluxos automatizados para engajar seus contatos.
              </p>
              <Link
                href="/flows/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Plus className="h-[18px] w-[18px]" />
                Criar Automacao
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Acoes Rapidas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/campaigns/new"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Plus className="h-[18px] w-[18px] text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Criar Campanha
              </p>
              <p className="text-xs text-gray-500">Enviar email</p>
            </div>
          </Link>
          <Link
            href="/flows/new"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Zap className="h-[18px] w-[18px] text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Criar Automacao
              </p>
              <p className="text-xs text-gray-500">Fluxo automatico</p>
            </div>
          </Link>
          <Link
            href="/audience/profiles"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Upload className="h-[18px] w-[18px] text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Importar Contatos
              </p>
              <p className="text-xs text-gray-500">CSV ou Shopify</p>
            </div>
          </Link>
          <Link
            href="/analytics"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <BarChart3 className="h-[18px] w-[18px] text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Ver Analytics
              </p>
              <p className="text-xs text-gray-500">Relatorios</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
