"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  ShoppingCart,
  Package,
  RotateCcw,
  Eye,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useStore } from "@/hooks/use-store"
import { Skeleton } from "@/components/ui/skeleton"

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
    description:
      "Receba novos clientes com um e-mail de boas-vindas e envie um cupom 2 dias depois.",
    icon: Mail,
  },
  {
    index: 1,
    name: "Carrinho Abandonado",
    description:
      "Recupere vendas enviando lembretes para quem iniciou o checkout mas não finalizou.",
    icon: ShoppingCart,
  },
  {
    index: 2,
    name: "Pós-compra",
    description:
      "Engaje clientes após a compra com e-mail de agradecimento e sugestões de produtos.",
    icon: Package,
  },
  {
    index: 3,
    name: "Reativação de Clientes",
    description:
      "Reconquiste clientes inativos após 60 dias sem comprar.",
    icon: RotateCcw,
  },
  {
    index: 4,
    name: "Abandono de Navegação",
    description:
      "Envie um lembrete para quem visualizou um produto mas não comprou.",
    icon: Eye,
  },
]

export default function NewFlowPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleUseTemplate() {
    if (selectedTemplate === null || !store) return
    setCreating(true)
    try {
      const res = await fetch("/api/flows/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIndex: selectedTemplate, storeId: store.id }),
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
      setCreating(false)
    }
  }

  if (storeLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/flows"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={18} />
          Voltar para Automações
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nova Automação</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selecione um template para começar rapidamente
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flowTemplates.map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.index
          return (
            <div
              key={template.index}
              onClick={() => setSelectedTemplate(template.index)}
              className={`cursor-pointer rounded-lg border p-6 transition-all hover:border-[#F26B2A] ${
                isSelected
                  ? "border-[#F26B2A] bg-orange-50 shadow-md"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  isSelected ? "bg-[#F26B2A] text-white" : "bg-gray-100"
                }`}
              >
                <Icon
                  size={22}
                  className={isSelected ? "text-white" : "text-gray-600"}
                />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                {template.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{template.description}</p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleUseTemplate}
          disabled={selectedTemplate === null || creating}
          className="bg-[#F26B2A] hover:bg-[#d95d24] text-white"
        >
          {creating ? "Criando..." : "Usar Template"}
        </Button>
      </div>
    </div>
  )
}
