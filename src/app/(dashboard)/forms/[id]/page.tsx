"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { toast } from "@/hooks/use-toast"
import {
  Monitor,
  Smartphone,
  Copy,
  Save,
  ChevronLeft,
  X,
} from "lucide-react"
import Link from "next/link"

interface FormField {
  key: string
  label: string
  placeholder: string
  required: boolean
  enabled: boolean
}

interface FormConfig {
  bgColor: string
  textColor: string
  buttonColor: string
  title: string
  subtitle: string
  fields: FormField[]
  trigger: string
  delay: number
  frequency: string
  successMessage: string
  redirectUrl: string
  couponEnabled: boolean
  couponCode: string
  listId: string
  tagName: string
  flowId: string
  type: string
}

const DEFAULT_FIELDS: FormField[] = [
  { key: "email", label: "Email", placeholder: "seu@email.com", required: true, enabled: true },
  { key: "name", label: "Nome", placeholder: "Seu nome", required: false, enabled: false },
  { key: "phone", label: "Telefone", placeholder: "(11) 99999-9999", required: false, enabled: false },
  { key: "birthday", label: "Data de nascimento", placeholder: "DD/MM/AAAA", required: false, enabled: false },
  { key: "custom", label: "Campo personalizado", placeholder: "Valor", required: false, enabled: false },
]

type ConfigTab = "design" | "fields" | "behavior" | "success"

export default function FormEditorPage() {
  const params = useParams()
  const formId = params.id as string
  const { store } = useStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ConfigTab>("design")
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop")
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [lists, setLists] = useState<{ id: string; name: string }[]>([])
  const [flows, setFlows] = useState<{ id: string; name: string }[]>([])

  const [config, setConfig] = useState<FormConfig>({
    bgColor: "#ffffff",
    textColor: "#111827",
    buttonColor: "#F97316",
    title: "Inscreva-se",
    subtitle: "Receba ofertas exclusivas no seu email",
    fields: DEFAULT_FIELDS,
    trigger: "after_seconds",
    delay: 3,
    frequency: "once_session",
    successMessage: "Obrigado! Você foi inscrito com sucesso.",
    redirectUrl: "",
    couponEnabled: false,
    couponCode: "",
    listId: "",
    tagName: "",
    flowId: "",
    type: "popup",
  })

  useEffect(() => {
    const supabase = createClient()
    async function fetchData() {
      const { data: form } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single()

      if (form) {
        const formConfig = (form.config as Record<string, unknown>) ?? {}
        setConfig((prev) => ({
          ...prev,
          type: (form.type as string) ?? "popup",
          title: (formConfig.title as string) ?? prev.title,
          subtitle: (formConfig.subtitle as string) ?? prev.subtitle,
          bgColor: (formConfig.bgColor as string) ?? prev.bgColor,
          textColor: (formConfig.textColor as string) ?? prev.textColor,
          buttonColor: (formConfig.buttonColor as string) ?? prev.buttonColor,
          successMessage: (formConfig.successMessage as string) ?? prev.successMessage,
          listId: (form.list_id as string) ?? "",
          tagName: (form.tag as string) ?? "",
          flowId: (form.welcome_flow_id as string) ?? "",
        }))
      }

      if (store?.id) {
        const [listsRes, flowsRes] = await Promise.all([
          supabase.from("lists").select("id, name").eq("store_id", store.id),
          supabase.from("flows").select("id, name").eq("store_id", store.id),
        ])
        setLists(listsRes.data ?? [])
        setFlows(flowsRes.data ?? [])
      }
      setLoading(false)
    }
    fetchData()
  }, [formId, store?.id])

  function updateConfig<K extends keyof FormConfig>(key: K, value: FormConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  function toggleField(index: number) {
    if (config.fields[index].key === "email") return
    const newFields = [...config.fields]
    newFields[index] = { ...newFields[index], enabled: !newFields[index].enabled }
    updateConfig("fields", newFields)
  }

  function updateFieldProp(index: number, prop: "label" | "placeholder" | "required", value: string | boolean) {
    const newFields = [...config.fields]
    newFields[index] = { ...newFields[index], [prop]: value }
    updateConfig("fields", newFields)
  }

  async function handleSave() {
    const supabase = createClient()
    await supabase.from("forms").update({
      config: {
        title: config.title,
        subtitle: config.subtitle,
        bgColor: config.bgColor,
        textColor: config.textColor,
        buttonColor: config.buttonColor,
        fields: config.fields,
        trigger: config.trigger,
        delay: config.delay,
        frequency: config.frequency,
        successMessage: config.successMessage,
        redirectUrl: config.redirectUrl,
        couponEnabled: config.couponEnabled,
        couponCode: config.couponCode,
      },
      list_id: config.listId || null,
      tag: config.tagName || null,
      welcome_flow_id: config.flowId || null,
    }).eq("id", formId)
    toast({ title: "Formulário salvo!", description: "Alterações aplicadas com sucesso." })
  }

  function copyEmbedCode() {
    const appUrl = typeof window !== "undefined" ? window.location.origin : ""
    const code = config.type === "popup"
      ? `<script src="${appUrl}/forms/${formId}.js"></script>`
      : `<div data-worder-form="${formId}"></div>`
    navigator.clipboard.writeText(code)
    toast({ title: "Código copiado!", description: "Cole no seu site." })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const enabledFields = config.fields.filter((f) => f.enabled)
  const tabs: { key: ConfigTab; label: string }[] = [
    { key: "design", label: "Design" },
    { key: "fields", label: "Campos" },
    { key: "behavior", label: "Comportamento" },
    { key: "success", label: "Sucesso" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/forms" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} /> Voltar
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/forms/${formId}/analytics`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Analytics
          </Link>
          <button
            onClick={() => setShowEmbedModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Copy size={16} /> Obter Código
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg flex items-center gap-1.5"
          >
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>

      <div className="flex gap-0 min-h-[calc(100vh-12rem)]">
        {/* Left Panel */}
        <div className="w-72 bg-white border border-gray-200 rounded-lg overflow-y-auto shrink-0">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-brand-700 border-b-2 border-brand-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {activeTab === "design" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Cor de fundo</label>
                  <input type="color" value={config.bgColor} onChange={(e) => updateConfig("bgColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Cor do texto</label>
                  <input type="color" value={config.textColor} onChange={(e) => updateConfig("textColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Cor do botão</label>
                  <input type="color" value={config.buttonColor} onChange={(e) => updateConfig("buttonColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Título</label>
                  <input type="text" value={config.title} onChange={(e) => updateConfig("title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Subtítulo</label>
                  <input type="text" value={config.subtitle} onChange={(e) => updateConfig("subtitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </>
            )}

            {activeTab === "fields" && (
              <div className="space-y-1">
                {config.fields.map((field, i) => (
                  <div key={field.key} className="py-2 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{field.label}{field.key === "email" ? " *" : ""}</span>
                      <button
                        onClick={() => toggleField(i)}
                        disabled={field.key === "email"}
                        className={`w-9 h-5 rounded-full transition-colors ${field.enabled ? "bg-brand-500" : "bg-gray-200"} ${field.key === "email" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${field.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    {field.enabled && field.key !== "email" && (
                      <div className="mt-2 space-y-2 pl-2">
                        <input type="text" value={field.label} onChange={(e) => updateFieldProp(i, "label", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Label" />
                        <input type="text" value={field.placeholder} onChange={(e) => updateFieldProp(i, "placeholder", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Placeholder" />
                        <label className="flex items-center gap-1.5 text-xs text-gray-500">
                          <input type="checkbox" checked={field.required} onChange={(e) => updateFieldProp(i, "required", e.target.checked)} className="rounded" />
                          Obrigatório
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "behavior" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Trigger</label>
                  <select value={config.trigger} onChange={(e) => updateConfig("trigger", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="after_seconds">Após X segundos</option>
                    <option value="exit_intent">Exit intent</option>
                    <option value="scroll_percent">Scroll %</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Delay (segundos)</label>
                  <input type="number" value={config.delay} onChange={(e) => updateConfig("delay", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Frequência</label>
                  <select value={config.frequency} onChange={(e) => updateConfig("frequency", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="every_visit">Toda visita</option>
                    <option value="once_session">1x por sessão</option>
                    <option value="once_day">1x por dia</option>
                    <option value="once_week">1x por semana</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "success" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Mensagem de sucesso</label>
                  <textarea value={config.successMessage} onChange={(e) => updateConfig("successMessage", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">URL de redirecionamento</label>
                  <input type="url" value={config.redirectUrl} onChange={(e) => updateConfig("redirectUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="https://..." />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Cupom automático</span>
                  <button onClick={() => updateConfig("couponEnabled", !config.couponEnabled)} className={`w-9 h-5 rounded-full transition-colors ${config.couponEnabled ? "bg-brand-500" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.couponEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {config.couponEnabled && (
                  <input type="text" value={config.couponCode} onChange={(e) => updateConfig("couponCode", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="DESCONTO10" />
                )}
              </>
            )}
          </div>
        </div>

        {/* Center Panel - Preview */}
        <div className="flex-1 bg-gray-100 flex flex-col items-center p-6">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDevicePreview("desktop")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${devicePreview === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              <Monitor size={16} /> Desktop
            </button>
            <button onClick={() => setDevicePreview("mobile")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${devicePreview === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              <Smartphone size={16} /> Mobile
            </button>
          </div>

          <div className={`${devicePreview === "desktop" ? "max-w-lg w-full" : "max-w-xs w-full"} rounded-lg shadow-lg overflow-hidden`} style={{ backgroundColor: config.bgColor }}>
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-2" style={{ color: config.textColor }}>{config.title}</h2>
              {config.subtitle && <p className="text-sm mb-6" style={{ color: config.textColor, opacity: 0.7 }}>{config.subtitle}</p>}
              <div className="space-y-3">
                {enabledFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium mb-1 block" style={{ color: config.textColor, opacity: 0.8 }}>
                      {field.label}{field.required ? " *" : ""}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    />
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: config.buttonColor }}>
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 bg-white border border-gray-200 rounded-lg overflow-y-auto shrink-0 p-4 space-y-6">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Destino</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Lista de destino</label>
                <select value={config.listId} onChange={(e) => updateConfig("listId", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Selecione uma lista</option>
                  {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tag automática</label>
                <input type="text" value={config.tagName} onChange={(e) => updateConfig("tagName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="ex: form-newsletter" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Flow de welcome</label>
                <select value={config.flowId} onChange={(e) => updateConfig("flowId", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Nenhum</option>
                  {flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowEmbedModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Código de Incorporação</h3>
              <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <code className="text-sm text-gray-800 break-all">
                {config.type === "popup"
                  ? `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/forms/${formId}.js"></script>`
                  : `<div data-worder-form="${formId}"></div>`}
              </code>
            </div>
            <button onClick={copyEmbedCode} className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-1.5">
              <Copy size={16} /> Copiar Código
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
