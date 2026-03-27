"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layers, Code, Globe, PanelRight, ArrowLeft } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type FormType = "popup" | "embedded" | "landing" | "flyout"

interface TypeOption {
  type: FormType
  icon: typeof Layers
  label: string
  description: string
}

const typeOptions: TypeOption[] = [
  {
    type: "popup",
    icon: Layers,
    label: "Popup",
    description: "Aparece sobre o conteúdo da página",
  },
  {
    type: "embedded",
    icon: Code,
    label: "Incorporado",
    description: "Integrado diretamente na página",
  },
  {
    type: "landing",
    icon: Globe,
    label: "Landing Page",
    description: "Página dedicada para captura",
  },
  {
    type: "flyout",
    icon: PanelRight,
    label: "Flyout / Slide-in",
    description: "Desliza a partir da lateral",
  },
]

const templatesByType: Record<FormType, string[]> = {
  popup: [
    "Newsletter Simples",
    "Desconto 10%",
    "Black Friday",
    "Leads B2B",
    "Lançamento",
    "VIP Club",
  ],
  embedded: [
    "Newsletter Simples",
    "Desconto 10%",
    "Black Friday",
    "Leads B2B",
    "Lançamento",
    "VIP Club",
  ],
  landing: [
    "Newsletter Simples",
    "Desconto 10%",
    "Black Friday",
    "Leads B2B",
    "Lançamento",
    "VIP Club",
  ],
  flyout: [
    "Newsletter Simples",
    "Desconto 10%",
    "Black Friday",
    "Leads B2B",
    "Lançamento",
    "VIP Club",
  ],
}

// Placeholder colors for template preview cards
const previewColors = [
  "bg-brand-100",
  "bg-blue-100",
  "bg-emerald-100",
  "bg-amber-100",
  "bg-purple-100",
  "bg-rose-100",
]

const steps = [
  { number: 1, label: "Tipo" },
  { number: 2, label: "Template" },
  { number: 3, label: "Editor" },
]

export default function NewFormPage() {
  const [step, setStep] = useState(0)
  const [formType, setFormType] = useState<FormType | null>(null)
  const [creating, setCreating] = useState(false)
  const { store } = useStore()
  const router = useRouter()

  function handleSelectType(type: FormType) {
    setFormType(type)
    setStep(1)
  }

  async function handleSelectTemplate(templateIndex: number) {
    if (!store?.id || !formType) return

    setCreating(true)
    const supabase = createClient()
    const templates = templatesByType[formType]
    const templateName = templates[templateIndex]

    const { data, error } = await supabase
      .from("forms")
      .insert({
        store_id: store.id,
        name: templateName,
        type: formType,
        status: "inactive",
        impressions: 0,
        submissions: 0,
        template_index: templateIndex,
      })
      .select("id")
      .single()

    if (!error && data) {
      router.push(`/forms/${data.id}`)
    } else {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-gray-900">
          Novo Formulário
        </h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  i <= step
                    ? "bg-brand-500 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {s.number}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  i <= step ? "text-gray-900" : "text-gray-400"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 h-px",
                  i < step ? "bg-brand-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 0 && (
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-1 text-center">
            Escolha o tipo de formulário
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Selecione como o formulário será exibido para seus visitantes
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {typeOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.type}
                  onClick={() => handleSelectType(option.type)}
                  className={cn(
                    "bg-white border shadow-sm rounded-lg p-6 cursor-pointer text-left transition-all",
                    formType === option.type
                      ? "border-brand-500 ring-2 ring-brand-200"
                      : "border-gray-200 hover:border-brand-300"
                  )}
                >
                  <Icon size={24} className="text-brand-500 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {option.label}
                  </h3>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Select Template */}
      {step === 1 && formType && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-1 text-center">
            Escolha um template
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Selecione um modelo para começar a personalizar
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {templatesByType[formType].map((name, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                {/* Preview area */}
                <div className={cn("h-40 flex items-center justify-center", previewColors[index])}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-3 bg-white/70 rounded" />
                    <div className="w-32 h-8 bg-white/50 rounded" />
                    <div className="w-20 h-6 bg-brand-500/30 rounded" />
                  </div>
                </div>
                {/* Info */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {name}
                  </span>
                  <button
                    onClick={() => handleSelectTemplate(index)}
                    disabled={creating}
                    className="inline-flex items-center bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {creating ? "Criando..." : "Usar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
