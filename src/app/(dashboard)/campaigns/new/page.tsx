"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Send,
  Calendar,
  Mail,
  Layout,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"

interface FormData {
  // Step 1: Configuração
  name: string
  subject: string
  sender_name: string
  sender_email: string
  preview_text: string
  ab_test: boolean
  subject_b: string
  // Step 2: Público
  recipient_type: "list" | "segment"
  list_id: string
  segment_id: string
  // Step 3: Conteúdo
  template_id: string
  // Step 4: schedule
  scheduled_at: string
}

interface SelectOption {
  id: string
  name: string
  count?: number
  thumbnail_url?: string | null
}

const STEPS = [
  { num: 1, label: "Configuração" },
  { num: 2, label: "Público" },
  { num: 3, label: "Conteúdo" },
  { num: 4, label: "Revisão" },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [sending, setSending] = useState(false)

  const [lists, setLists] = useState<SelectOption[]>([])
  const [segments, setSegments] = useState<SelectOption[]>([])
  const [templates, setTemplates] = useState<SelectOption[]>([])

  const [formData, setFormData] = useState<FormData>({
    name: "",
    subject: "",
    sender_name: "",
    sender_email: "",
    preview_text: "",
    ab_test: false,
    subject_b: "",
    recipient_type: "list",
    list_id: "",
    segment_id: "",
    template_id: "",
    scheduled_at: "",
  })

  // Fetch lists, segments, templates
  useEffect(() => {
    if (!store?.id) return
    const supabase = createClient()

    async function fetchOptions() {
      const [listsRes, segmentsRes, templatesRes] = await Promise.all([
        supabase.from("lists").select("id, name, member_count").eq("store_id", store!.id),
        supabase.from("segments").select("id, name, contact_count").eq("store_id", store!.id),
        supabase
          .from("templates")
          .select("id, name, thumbnail_url")
          .eq("store_id", store!.id)
          .eq("type", "email"),
      ])
      setLists(
        (listsRes.data ?? []).map((l) => ({
          id: l.id,
          name: l.name,
          count: l.member_count as number | undefined,
        }))
      )
      setSegments(
        (segmentsRes.data ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          count: s.contact_count as number | undefined,
        }))
      )
      setTemplates(
        (templatesRes.data ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          thumbnail_url: t.thumbnail_url as string | null,
        }))
      )
    }

    // Pre-fill sender from store
    if (store.sender_name || store.sender_email) {
      setFormData((prev) => ({
        ...prev,
        sender_name: prev.sender_name || store.sender_name || "",
        sender_email: prev.sender_email || store.sender_email || "",
      }))
    }

    fetchOptions()
  }, [store?.id, store?.sender_name, store?.sender_email])

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function canAdvance(): boolean {
    if (currentStep === 0) {
      if (!formData.name.trim() || !formData.subject.trim()) return false
      if (formData.ab_test && !formData.subject_b.trim()) return false
    }
    return true
  }

  function handleNext() {
    if (!canAdvance()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive",
      })
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  async function createCampaign(scheduledAt?: string) {
    if (!store?.id) return
    setSending(true)

    try {
      // 1. Create campaign
      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store.id,
          name: formData.name,
          subject: formData.subject,
          template_id: formData.template_id || null,
          list_id: formData.recipient_type === "list" ? formData.list_id || null : null,
          segment_id: formData.recipient_type === "segment" ? formData.segment_id || null : null,
          sender_name: formData.sender_name || null,
          sender_email: formData.sender_email || null,
          ab_test_enabled: formData.ab_test,
          subject_b: formData.ab_test ? formData.subject_b : null,
          scheduled_at: scheduledAt ?? null,
        }),
      })

      const createData = await createRes.json()
      if (!createRes.ok) {
        throw new Error(createData.error || "Erro ao criar campanha")
      }

      const campaignId = createData.campaign?.id

      // 2. If sending now (not scheduling), trigger send
      if (!scheduledAt && campaignId) {
        const sendRes = await fetch("/api/campaigns/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId }),
        })

        if (!sendRes.ok) {
          const sendData = await sendRes.json()
          throw new Error(sendData.error || "Erro ao enviar campanha")
        }

        toast({
          title: "Campanha enviada!",
          description: "Sua campanha está sendo enviada para os contatos.",
        })
      } else {
        toast({
          title: "Campanha agendada!",
          description: `Sua campanha será enviada em ${new Date(scheduledAt!).toLocaleString("pt-BR")}.`,
        })
      }

      router.push("/campaigns")
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  function handleSendNow() {
    createCampaign()
  }

  function handleSchedule() {
    if (!formData.scheduled_at) {
      toast({
        title: "Data obrigatória",
        description: "Selecione a data e hora para agendar o envio.",
        variant: "destructive",
      })
      return
    }
    createCampaign(formData.scheduled_at)
  }

  // Computed values
  const selectedList = lists.find((l) => l.id === formData.list_id)
  const selectedSegment = segments.find((s) => s.id === formData.segment_id)
  const contactCount =
    formData.recipient_type === "list"
      ? selectedList?.count ?? 0
      : selectedSegment?.count ?? 0
  const selectedTemplate = templates.find((t) => t.id === formData.template_id)

  if (storeLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-white border border-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-6 py-6">
      <h1 className="text-2xl font-semibold text-gray-900">Nova Campanha</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? "bg-brand-500 text-white"
                    : index === currentStep
                      ? "bg-brand-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  index <= currentStep ? "text-brand-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 mb-5 ${
                  index < currentStep ? "bg-brand-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        {/* Step 1: Configuração */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Configuração</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome da campanha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ex: Black Friday 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder="Ex: Ofertas imperdíveis para você"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome do remetente
                </label>
                <input
                  type="text"
                  value={formData.sender_name}
                  onChange={(e) => updateField("sender_name", e.target.value)}
                  placeholder="Sua Loja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email do remetente
                </label>
                <input
                  type="email"
                  value={formData.sender_email}
                  onChange={(e) => updateField("sender_email", e.target.value)}
                  placeholder="contato@sualoja.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preview text
              </label>
              <input
                type="text"
                value={formData.preview_text}
                onChange={(e) => updateField("preview_text", e.target.value)}
                placeholder="Texto de prévia do email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Texto que aparece após o assunto na caixa de entrada
              </p>
            </div>

            {/* A/B Test toggle */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ab_test}
                  onChange={(e) => updateField("ab_test", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Habilitar Teste A/B
                </span>
              </label>

              {formData.ab_test && (
                <div className="pl-6 border-l-2 border-brand-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Assunto B <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject_b}
                    onChange={(e) => updateField("subject_b", e.target.value)}
                    placeholder="Variante B do assunto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Público */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Público</h2>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  checked={formData.recipient_type === "list"}
                  onChange={() => updateField("recipient_type", "list")}
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enviar para Lista
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  checked={formData.recipient_type === "segment"}
                  onChange={() => updateField("recipient_type", "segment")}
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enviar para Segmento
                </span>
              </label>
            </div>

            {formData.recipient_type === "list" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Selecionar lista
                </label>
                <select
                  value={formData.list_id}
                  onChange={(e) => updateField("list_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">Selecione uma lista</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.count ?? 0} contatos)
                    </option>
                  ))}
                  {lists.length === 0 && (
                    <option value="" disabled>
                      Nenhuma lista disponível
                    </option>
                  )}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Selecionar segmento
                </label>
                <select
                  value={formData.segment_id}
                  onChange={(e) => updateField("segment_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">Selecione um segmento</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.count ?? 0} contatos)
                    </option>
                  ))}
                  {segments.length === 0 && (
                    <option value="" disabled>
                      Nenhum segmento disponível
                    </option>
                  )}
                </select>
              </div>
            )}

            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                contactCount === 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <Users className="w-[18px] h-[18px]" />
              Estimativa: {contactCount.toLocaleString("pt-BR")} contatos
            </div>
          </div>
        )}

        {/* Step 3: Conteúdo */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Conteúdo</h2>
            <p className="text-sm text-gray-500">
              Selecione um template para sua campanha.
            </p>

            {templates.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateField("template_id", t.id)}
                    className={`border rounded-lg p-3 text-left transition-all hover:shadow ${
                      formData.template_id === t.id
                        ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                      {t.thumbnail_url ? (
                        <img
                          src={t.thumbnail_url}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layout className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.name}
                    </p>
                    {formData.template_id === t.id && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-brand-600">
                        <Check className="w-3 h-3" />
                        Selecionado
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-300 rounded-lg">
                <Layout size={40} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  Nenhum template disponível. Crie um template primeiro.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Revisão */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Revisar e Enviar
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Nome</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.name || "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Assunto</p>
                <p className="text-sm font-medium text-gray-900 break-words">
                  {formData.ab_test
                    ? `A: ${formData.subject || "—"} / B: ${formData.subject_b || "—"}`
                    : formData.subject || "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Remetente</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.sender_name || formData.sender_email
                    ? `${formData.sender_name} <${formData.sender_email}>`
                    : "Não configurado"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Destinatários
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {contactCount.toLocaleString("pt-BR")} contatos
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Template</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedTemplate?.name || "Não selecionado"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Teste A/B
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.ab_test ? "Sim" : "Não"}
                </p>
              </div>
            </div>

            {/* Schedule date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Agendar para (opcional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => updateField("scheduled_at", e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendNow}
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Send className="w-[18px] h-[18px]" />
                {sending ? "Enviando..." : "Enviar Agora"}
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Calendar className="w-[18px] h-[18px]" />
                Agendar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-[18px] h-[18px]" />
              Anterior
            </button>
          )}
        </div>
        <div>
          {currentStep < STEPS.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Próximo
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
