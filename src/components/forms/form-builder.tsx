"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { Palette } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FormConfig {
  title: string
  subtitle: string
  buttonText: string
  buttonColor: string
  successMessage: string
  fields: { name: string; label: string; type: string; required: boolean }[]
  triggerType?: "delay" | "exit_intent" | "scroll" | "manual"
  triggerValue?: number
  listId?: string
}

interface FormBuilderProps {
  config: FormConfig
  onChange: (config: FormConfig) => void
  formType?: "popup" | "embedded" | "landing"
}

interface ListOption {
  id: string
  name: string
}

export default function FormBuilder({ config, onChange, formType }: FormBuilderProps) {
  const { store } = useStore()
  const [lists, setLists] = useState<ListOption[]>([])

  useEffect(() => {
    if (!store) return
    const supabase = createClient()
    supabase
      .from("lists")
      .select("id, name")
      .eq("store_id", store.id)
      .order("name")
      .then(({ data }) => {
        if (data) {
          setLists(data as ListOption[])
        }
      })
  }, [store])

  const updateConfig = (partial: Partial<FormConfig>) => {
    onChange({ ...config, ...partial })
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Preview - 60% */}
      <div className="col-span-3">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-[18px] w-[18px] text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Pré-visualização
            </h3>
          </div>
          <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-8">
            <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 text-center">
                {config.title || "Título do formulário"}
              </h2>
              {config.subtitle && (
                <p className="mt-2 text-sm text-gray-500 text-center">
                  {config.subtitle}
                </p>
              )}
              <div className="mt-6 space-y-3">
                {config.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-0.5">*</span>
                      )}
                    </label>
                    <div className="w-full h-9 bg-gray-100 border border-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 w-full h-10 text-white text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: config.buttonColor || "#F97316" }}
              >
                {config.buttonText || "Inscrever-se"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Config panel - 40% */}
      <div className="col-span-2 space-y-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Configurações de Design
          </h3>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">
              Título do formulário
            </Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="Inscreva-se na nossa newsletter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-sm">
              Subtítulo
            </Label>
            <Input
              id="subtitle"
              value={config.subtitle}
              onChange={(e) => updateConfig({ subtitle: e.target.value })}
              placeholder="Receba ofertas exclusivas e novidades"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonText" className="text-sm">
              Texto do botão
            </Label>
            <Input
              id="buttonText"
              value={config.buttonText}
              onChange={(e) => updateConfig({ buttonText: e.target.value })}
              placeholder="Inscrever-se"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonColor" className="text-sm">
              Cor do botão
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="buttonColor"
                type="color"
                value={config.buttonColor || "#F97316"}
                onChange={(e) => updateConfig({ buttonColor: e.target.value })}
                className="h-9 w-12 rounded border border-gray-200 cursor-pointer"
              />
              <Input
                value={config.buttonColor || "#F97316"}
                onChange={(e) => updateConfig({ buttonColor: e.target.value })}
                placeholder="#F97316"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="successMessage" className="text-sm">
              Mensagem de sucesso
            </Label>
            <Textarea
              id="successMessage"
              value={config.successMessage}
              onChange={(e) => updateConfig({ successMessage: e.target.value })}
              placeholder="Obrigado! Você foi inscrito com sucesso."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listId" className="text-sm">
              Lista de destino
            </Label>
            <Select
              value={config.listId || ""}
              onValueChange={(value) => updateConfig({ listId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma lista" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formType === "popup" && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Configurações do Popup
            </h3>

            <div className="space-y-2">
              <Label htmlFor="triggerType" className="text-sm">
                Gatilho de exibição
              </Label>
              <Select
                value={config.triggerType || "delay"}
                onValueChange={(value) =>
                  updateConfig({
                    triggerType: value as FormConfig["triggerType"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gatilho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delay">Após X segundos</SelectItem>
                  <SelectItem value="exit_intent">
                    Intenção de saída
                  </SelectItem>
                  <SelectItem value="scroll">Ao rolar X%</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.triggerType === "delay" && (
              <div className="space-y-2">
                <Label htmlFor="triggerValue" className="text-sm">
                  Segundos de atraso
                </Label>
                <Input
                  id="triggerValue"
                  type="number"
                  min={1}
                  max={120}
                  value={config.triggerValue ?? 5}
                  onChange={(e) =>
                    updateConfig({ triggerValue: Number(e.target.value) })
                  }
                />
              </div>
            )}

            {config.triggerType === "scroll" && (
              <div className="space-y-2">
                <Label htmlFor="triggerValue" className="text-sm">
                  Porcentagem de rolagem
                </Label>
                <Input
                  id="triggerValue"
                  type="number"
                  min={10}
                  max={100}
                  value={config.triggerValue ?? 50}
                  onChange={(e) =>
                    updateConfig({ triggerValue: Number(e.target.value) })
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
