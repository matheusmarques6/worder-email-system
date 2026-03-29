"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Zap,
  Plus,
  Mail,
  ShoppingCart,
  Package,
  RotateCcw,
  Eye,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import type { Flow } from "@/types"

const statusConfig = {
  live: {
    label: "Ativo",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  draft: {
    label: "Rascunho",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
  paused: {
    label: "Pausado",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
}

const triggerLabels: Record<string, string> = {
  metric: "Métrica",
  list: "Lista",
  segment: "Segmento",
  date_property: "Data",
}

interface FlowTemplateCard {
  index: number
  name: string
  description: string
  icon: React.ElementType
}

const flowTemplates: FlowTemplateCard[] = [
  {
    index: 0,
    name: "Série de Boas-vindas",
    description: "Receba novos clientes com e-mail de boas-vindas e cupom",
    icon: Mail,
  },
  {
    index: 1,
    name: "Carrinho Abandonado",
    description: "Recupere vendas de checkouts incompletos",
    icon: ShoppingCart,
  },
  {
    index: 2,
    name: "Pós-compra",
    description: "Engaje clientes após a compra com sugestões",
    icon: Package,
  },
  {
    index: 3,
    name: "Reativação de Clientes",
    description: "Reconquiste clientes inativos após 60 dias",
    icon: RotateCcw,
  },
  {
    index: 4,
    name: "Abandono de Navegação",
    description: "Lembrete para quem visualizou produtos sem comprar",
    icon: Eye,
  },
]

export default function FlowsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<number | null>(null)

  const fetchFlows = useCallback(async () => {
    if (!store) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Erro ao carregar automações")
      setLoading(false)
      return
    }
    setFlows((data as Flow[]) ?? [])
    setLoading(false)
  }, [store])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchFlows()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [store, storeLoading, fetchFlows])

  async function handleUseTemplate(templateIndex: number) {
    if (!store) return
    setActivating(templateIndex)
    try {
      const res = await fetch("/api/flows/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIndex, storeId: store.id }),
      })
      const json = await res.json()
      if (!res.ok || !json.flow) {
        toast.error("Erro ao criar automação")
        return
      }
      toast.success("Automação criada!")
      router.push(`/flows/${json.flow.id}`)
    } catch {
      toast.error("Erro ao criar automação")
    } finally {
      setActivating(null)
    }
  }

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Automações</h1>
        <Link href="/flows/new">
          <Button className="bg-[#F26B2A] hover:bg-[#d95d24] text-white">
            <Plus size={18} className="mr-2" />
            Nova Automação
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {flows.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <Zap size={24} className="text-[#F26B2A]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhuma automação criada
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            70% dos compradores abandonam o carrinho. Recupere vendas perdidas
            com automações inteligentes que trabalham 24/7 por você.
          </p>
        </div>
      )}

      {/* Prebuilt flow templates */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Templates de Automação
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {flowTemplates.map((template) => {
            const Icon = template.icon
            return (
              <div
                key={template.index}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#F26B2A] hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Icon size={20} className="text-[#F26B2A]" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                  {template.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {template.description}
                </p>
                <Button
                  onClick={() => handleUseTemplate(template.index)}
                  disabled={activating === template.index}
                  size="sm"
                  className="mt-4 w-full bg-[#F26B2A] hover:bg-[#d95d24] text-white"
                >
                  {activating === template.index ? "Criando..." : "Usar"}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Existing flows table */}
      {flows.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Suas Automações
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Enviados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {flows.map((flow) => {
                  const status =
                    statusConfig[flow.status as keyof typeof statusConfig] ||
                    statusConfig.draft
                  return (
                    <tr key={flow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/flows/${flow.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#F26B2A]"
                        >
                          {flow.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {triggerLabels[flow.trigger_type] || flow.trigger_type}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={status.className}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {flow.total_emails_sent.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        R$ 0,00
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
