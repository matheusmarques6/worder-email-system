"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Code,
  Eye,
  Layers,
  FileText,
  MousePointer,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormType = "popup" | "embedded" | "landing"

interface FieldConfig {
  name: string
  label: string
  type: string
  required: boolean
}

interface FormConfig {
  title: string
  subtitle: string
  buttonText: string
  buttonColor: string
  successMessage: string
  fields: FieldConfig[]
  triggerType?: "delay" | "exit_intent" | "scroll" | "manual"
  triggerValue?: number
  listId?: string
}

interface ListOption {
  id: string
  name: string
}

const typeOptions: {
  value: FormType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: "popup",
    label: "Popup",
    description: "Exibido sobre o conteúdo da página com gatilhos configuráveis",
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    value: "embedded",
    label: "Embedded",
    description: "Incorporado diretamente no conteúdo do seu site",
    icon: <Code className="h-6 w-6" />,
  },
  {
    value: "landing",
    label: "Landing Page",
    description: "Página completa e independente para captura de leads",
    icon: <FileText className="h-6 w-6" />,
  },
]

const defaultFields: FieldConfig[] = [
  { name: "email", label: "Email", type: "email", required: true },
]

function generateEmbedCode(formId: string, config: FormConfig, formType: FormType): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://app.convertfy.com"

  if (formType === "popup") {
    return `<!-- Convertfy Popup Form -->
<script>
(function() {
  var formId = "${formId}";
  var config = {
    trigger: "${config.triggerType || "delay"}",
    triggerValue: ${config.triggerValue ?? 5}
  };
  var s = document.createElement("script");
  s.src = "${origin}/embed/popup.js?id=" + formId;
  s.async = true;
  document.head.appendChild(s);
})();
</script>`
  }

  return `<!-- Convertfy Embedded Form -->
<div id="convertfy-form-${formId}"></div>
<script>
(function() {
  var formId = "${formId}";
  var s = document.createElement("script");
  s.src = "${origin}/embed/form.js?id=" + formId;
  s.async = true;
  document.head.appendChild(s);
})();
</script>`
}

export default function NewFormPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const [formType, setFormType] = useState<FormType>("popup")
  const [formName, setFormName] = useState("")
  const [fields, setFields] = useState<FieldConfig[]>([...defaultFields])
  const [includeNameField, setIncludeNameField] = useState(false)
  const [includePhoneField, setIncludePhoneField] = useState(false)
  const [customFields, setCustomFields] = useState<string[]>([])
  const [newCustomField, setNewCustomField] = useState("")
  const [selectedListId, setSelectedListId] = useState("")
  const [lists, setLists] = useState<ListOption[]>([])

  const [config, setConfig] = useState<FormConfig>({
    title: "Inscreva-se na nossa newsletter",
    subtitle: "Receba ofertas exclusivas e novidades",
    buttonText: "Inscrever-se",
    buttonColor: "#F97316",
    successMessage: "Obrigado! Voc\u00ea foi inscrito com sucesso.",
    fields: [...defaultFields],
    triggerType: "delay",
    triggerValue: 5,
  })

  const [previewFormId] = useState("preview-" + Date.now())

  const fetchLists = useCallback(async () => {
    if (!store) return
    const supabase = createClient()
    const { data } = await supabase
      .from("lists")
      .select("id, name")
      .eq("store_id", store.id)
      .order("name")
    if (data) {
      setLists(data as ListOption[])
    }
  }, [store])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  // Sync fields when checkboxes change
  useEffect(() => {
    const updatedFields: FieldConfig[] = [
      { name: "email", label: "Email", type: "email", required: true },
    ]
    if (includeNameField) {
      updatedFields.push({ name: "name", label: "Nome", type: "text", required: false })
    }
    if (includePhoneField) {
      updatedFields.push({ name: "phone", label: "Telefone", type: "tel", required: false })
    }
    customFields.forEach((cf) => {
      updatedFields.push({ name: cf.toLowerCase().replace(/\s+/g, "_"), label: cf, type: "text", required: false })
    })
    setFields(updatedFields)
    setConfig((prev) => ({ ...prev, fields: updatedFields }))
  }, [includeNameField, includePhoneField, customFields])

  const addCustomField = () => {
    const trimmed = newCustomField.trim()
    if (!trimmed) return
    if (customFields.includes(trimmed)) {
      toast.error("Campo j\u00e1 adicionado")
      return
    }
    setCustomFields((prev) => [...prev, trimmed])
    setNewCustomField("")
  }

  const removeCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCopyEmbed = async () => {
    const code = generateEmbedCode(previewFormId, config, formType)
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("C\u00f3digo copiado!")
  }

  const handleSubmit = async () => {
    if (!store) {
      toast.error("Loja n\u00e3o encontrada")
      return
    }

    if (!formName.trim()) {
      toast.error("Digite um nome para o formul\u00e1rio")
      return
    }

    setSubmitting(true)

    const supabase = createClient()
    const finalConfig: FormConfig = {
      ...config,
      fields,
      listId: selectedListId || undefined,
    }

    const { error } = await supabase.from("forms").insert({
      store_id: store.id,
      name: formName.trim(),
      type: formType,
      status: "inactive",
      config: finalConfig,
      submissions_count: 0,
      conversion_rate: 0,
    })

    if (error) {
      toast.error("Erro ao criar formul\u00e1rio")
      setSubmitting(false)
      return
    }

    toast.success("Formul\u00e1rio criado com sucesso!")
    router.push("/forms")
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return true
      case 2:
        return fields.length > 0
      case 3:
        return config.title.trim().length > 0 && config.buttonText.trim().length > 0
      case 4:
        return formName.trim().length > 0
      default:
        return false
    }
  }

  if (storeLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 w-full bg-gray-200 animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/forms"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Voltar para Formul\u00e1rios
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Criar Formul\u00e1rio</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                s === step
                  ? "bg-brand-500 text-white"
                  : s < step
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </div>
            <span
              className={`text-sm ${
                s === step ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {s === 1 && "Tipo"}
              {s === 2 && "Campos"}
              {s === 3 && "Design"}
              {s === 4 && "Preview"}
            </span>
            {s < 4 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1 - Type */}
      {step === 1 && (
        <div className="grid grid-cols-3 gap-4">
          {typeOptions.map((option) => (
            <Card
              key={option.value}
              className={`p-6 cursor-pointer transition-colors hover:border-brand-300 ${
                formType === option.value
                  ? "border-brand-500 border-2"
                  : "border-gray-200"
              }`}
              onClick={() => setFormType(option.value)}
            >
              <div
                className={`mb-3 ${
                  formType === option.value ? "text-brand-500" : "text-gray-400"
                }`}
              >
                {option.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{option.label}</h3>
              <p className="mt-1 text-sm text-gray-500">{option.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2 - Fields */}
      {step === 2 && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-6">
          <h3 className="text-sm font-semibold text-gray-900">Campos do formul\u00e1rio</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox id="field-email" checked disabled />
              <Label htmlFor="field-email" className="text-sm text-gray-700">
                Email <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600 text-xs">Obrigat\u00f3rio</Badge>
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="field-name"
                checked={includeNameField}
                onCheckedChange={(checked) => setIncludeNameField(checked === true)}
              />
              <Label htmlFor="field-name" className="text-sm text-gray-700">
                Nome
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="field-phone"
                checked={includePhoneField}
                onCheckedChange={(checked) => setIncludePhoneField(checked === true)}
              />
              <Label htmlFor="field-phone" className="text-sm text-gray-700">
                Telefone
              </Label>
            </div>
          </div>

          {/* Custom fields */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Campos personalizados</h4>
            {customFields.map((cf, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={cf} disabled className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomField(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-[18px] w-[18px]" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newCustomField}
                onChange={(e) => setNewCustomField(e.target.value)}
                placeholder="Nome do campo personalizado"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomField()
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomField}
                className="border-gray-300"
              >
                <Plus className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </div>

          {/* Select list */}
          <div className="space-y-2">
            <Label className="text-sm">Lista de destino</Label>
            <Select value={selectedListId} onValueChange={setSelectedListId}>
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
            <p className="text-xs text-gray-500">
              Os contatos ser\u00e3o adicionados a esta lista ao submeter o formul\u00e1rio
            </p>
          </div>
        </div>
      )}

      {/* Step 3 - Design */}
      {step === 3 && (
        <div className="grid grid-cols-5 gap-6">
          {/* Preview */}
          <div className="col-span-3">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-[18px] w-[18px] text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Pr\u00e9-visualiza\u00e7\u00e3o
                </h3>
              </div>
              <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-8">
                <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 text-center">
                    {config.title || "T\u00edtulo do formul\u00e1rio"}
                  </h2>
                  {config.subtitle && (
                    <p className="mt-2 text-sm text-gray-500 text-center">
                      {config.subtitle}
                    </p>
                  )}
                  <div className="mt-6 space-y-3">
                    {fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
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

          {/* Config */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Configura\u00e7\u00f5es de Design
              </h3>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">T\u00edtulo do formul\u00e1rio</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Inscreva-se na nossa newsletter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-sm">Subt\u00edtulo</Label>
                <Input
                  id="subtitle"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="Receba ofertas exclusivas e novidades"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-sm">Texto do bot\u00e3o</Label>
                <Input
                  id="buttonText"
                  value={config.buttonText}
                  onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                  placeholder="Inscrever-se"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonColor" className="text-sm">Cor do bot\u00e3o</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="buttonColor"
                    type="color"
                    value={config.buttonColor || "#F97316"}
                    onChange={(e) => setConfig({ ...config, buttonColor: e.target.value })}
                    className="h-9 w-12 rounded border border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={config.buttonColor || "#F97316"}
                    onChange={(e) => setConfig({ ...config, buttonColor: e.target.value })}
                    placeholder="#F97316"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="successMessage" className="text-sm">Mensagem de sucesso</Label>
                <Textarea
                  id="successMessage"
                  value={config.successMessage}
                  onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
                  placeholder="Obrigado! Voc\u00ea foi inscrito com sucesso."
                  rows={2}
                />
              </div>
            </div>

            {formType === "popup" && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Configura\u00e7\u00f5es do Popup
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="triggerType" className="text-sm">Gatilho de exibi\u00e7\u00e3o</Label>
                  <Select
                    value={config.triggerType || "delay"}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        triggerType: value as FormConfig["triggerType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delay">Ap\u00f3s X segundos</SelectItem>
                      <SelectItem value="exit_intent">Inten\u00e7\u00e3o de sa\u00edda</SelectItem>
                      <SelectItem value="scroll">Ao rolar X%</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.triggerType === "delay" && (
                  <div className="space-y-2">
                    <Label htmlFor="triggerValue" className="text-sm">Segundos de atraso</Label>
                    <Input
                      id="triggerValue"
                      type="number"
                      min={1}
                      max={120}
                      value={config.triggerValue ?? 5}
                      onChange={(e) =>
                        setConfig({ ...config, triggerValue: Number(e.target.value) })
                      }
                    />
                  </div>
                )}

                {config.triggerType === "scroll" && (
                  <div className="space-y-2">
                    <Label htmlFor="triggerValue" className="text-sm">Porcentagem de rolagem</Label>
                    <Input
                      id="triggerValue"
                      type="number"
                      min={10}
                      max={100}
                      value={config.triggerValue ?? 50}
                      onChange={(e) =>
                        setConfig({ ...config, triggerValue: Number(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4 - Preview + Code */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Form name */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Nome do formul\u00e1rio</h3>
            <div className="space-y-2">
              <Label htmlFor="formName" className="text-sm">Nome</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Newsletter Principal, Popup Black Friday"
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-[18px] w-[18px] text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                Pr\u00e9-visualiza\u00e7\u00e3o Final
              </h3>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                {formType === "popup" ? "Popup" : formType === "embedded" ? "Embedded" : "Landing Page"}
              </Badge>
            </div>
            <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg p-8">
              <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  {config.title}
                </h2>
                {config.subtitle && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    {config.subtitle}
                  </p>
                )}
                <div className="mt-6 space-y-3">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
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

          {/* Embed code */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="h-[18px] w-[18px] text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">C\u00f3digo de Incorpora\u00e7\u00e3o</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEmbed}
                className="border-gray-300 text-gray-700"
              >
                {copied ? (
                  <Check className="mr-2 h-[18px] w-[18px] text-green-500" />
                ) : (
                  <Copy className="mr-2 h-[18px] w-[18px]" />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
            <Textarea
              readOnly
              value={generateEmbedCode(previewFormId, config, formType)}
              rows={10}
              className="font-mono text-xs bg-gray-50"
            />
            <p className="mt-2 text-xs text-gray-500">
              Cole este c\u00f3digo no HTML do seu site para exibir o formul\u00e1rio.
              O c\u00f3digo final ser\u00e1 gerado ap\u00f3s a cria\u00e7\u00e3o.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="border-gray-300 text-gray-700"
        >
          <ArrowLeft className="mr-2 h-[18px] w-[18px]" />
          Anterior
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={!canProceed()}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            Pr\u00f3ximo
            <ArrowRight className="ml-2 h-[18px] w-[18px]" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {submitting ? "Criando..." : "Criar Formul\u00e1rio"}
            <MousePointer className="ml-2 h-[18px] w-[18px]" />
          </Button>
        )}
      </div>
    </div>
  )
}
