"use client"

import { useState } from "react"
import { useStore } from "@/hooks/use-store"
import { toast } from "sonner"
import { CreditCard, Check, Zap, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PlanFeature {
  label: string
  included: boolean
}

interface Plan {
  name: string
  price: string
  description: string
  emailLimit: string
  features: PlanFeature[]
  highlighted?: boolean
  icon: React.ComponentType<{ className?: string }>
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "R$ 0",
    description: "Para quem está começando",
    emailLimit: "3.000 emails/mês",
    icon: CreditCard,
    features: [
      { label: "3.000 emails por mês", included: true },
      { label: "1 usuário", included: true },
      { label: "Automações básicas", included: true },
      { label: "Templates pré-prontos", included: true },
      { label: "Segmentação avançada", included: false },
      { label: "Remoção de branding", included: false },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Pro",
    price: "R$ 97/mês",
    description: "Para lojas em crescimento",
    emailLimit: "50.000 emails/mês",
    icon: Zap,
    highlighted: true,
    features: [
      { label: "50.000 emails por mês", included: true },
      { label: "5 usuários", included: true },
      { label: "Automações avançadas", included: true },
      { label: "Templates pré-prontos", included: true },
      { label: "Segmentação avançada", included: true },
      { label: "Remoção de branding", included: true },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "R$ 297/mês",
    description: "Para operações de alto volume",
    emailLimit: "Emails ilimitados",
    icon: Building2,
    features: [
      { label: "Emails ilimitados", included: true },
      { label: "Usuários ilimitados", included: true },
      { label: "Automações avançadas", included: true },
      { label: "Templates pré-prontos", included: true },
      { label: "Segmentação avançada", included: true },
      { label: "Remoção de branding", included: true },
      { label: "Suporte prioritário", included: true },
    ],
  },
]

export default function BillingPage() {
  const { store, loading } = useStore()
  const [currentPlan] = useState("Free")
  const emailsSent = 0
  const emailLimit = 3000
  const usagePercent = Math.round((emailsSent / emailLimit) * 100)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Faturamento</h1>

      {/* Current plan card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
              <Badge className="border-transparent bg-brand-100 text-brand-700 hover:bg-brand-100">
                {currentPlan}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Seu plano atual inclui até {emailLimit.toLocaleString("pt-BR")} emails por mês.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {emailsSent.toLocaleString("pt-BR")} de{" "}
                  {emailLimit.toLocaleString("pt-BR")} emails enviados este mês
                </span>
                <span className="font-medium text-gray-900">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
            </div>
            <p className="text-xs text-gray-500">
              Renovação em 01/04/2026
            </p>
          </div>
          <Button
            className="ml-6"
            onClick={() => toast.info("Em breve! Upgrade de plano estará disponível.")}
          >
            Fazer Upgrade
          </Button>
        </div>
      </div>

      {/* Plans comparison */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparar Planos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrent = plan.name === currentPlan

            return (
              <div
                key={plan.name}
                className={`bg-white border shadow-sm rounded-lg p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-brand-500 ring-1 ring-brand-500"
                    : "border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4">
                    <Badge className="border-transparent bg-brand-500 text-white hover:bg-brand-500">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-[18px] w-[18px] text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</p>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-2 text-sm">
                      <Check
                        className={`h-[18px] w-[18px] flex-shrink-0 ${
                          feature.included ? "text-green-500" : "text-gray-300"
                        }`}
                      />
                      <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? "secondary" : "default"}
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() =>
                    toast.info("Em breve! Upgrade de plano estará disponível.")
                  }
                >
                  {isCurrent ? "Plano Atual" : "Selecionar Plano"}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoice history */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Faturas</h2>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-gray-500"
                >
                  Nenhuma fatura ainda
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
