"use client"

import { useState, useEffect } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Send,
  Calendar,
  X,
  Plus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface CampaignWizardProps {
  storeId: string
}

interface CampaignFormData {
  // Step 1
  name: string
  tags: string[]
  abTest: boolean
  subjectA: string
  subjectB: string
  abSplit: number
  abCheckHours: number
  // Step 2
  recipientType: "list" | "segment"
  listId: string
  segmentId: string
  excludeUnengaged: boolean
  smartSending: boolean
  // Step 3
  templateId: string
  subject: string
  previewText: string
  senderName: string
  senderEmail: string
}

const STEPS = ["Informações", "Destinatários", "Conteúdo", "Revisar"] as const

interface SelectOption {
  id: string
  name: string
  count?: number
}

export function CampaignWizard({ storeId }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tagInput, setTagInput] = useState("")
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [lists, setLists] = useState<SelectOption[]>([])
  const [segments, setSegments] = useState<SelectOption[]>([])
  const [templates, setTemplates] = useState<SelectOption[]>([])

  useEffect(() => {
    if (!storeId) return
    const supabase = createClient()

    async function fetchOptions() {
      const [listsRes, segmentsRes, templatesRes] = await Promise.all([
        supabase.from("lists").select("id, name, member_count").eq("store_id", storeId),
        supabase.from("segments").select("id, name, contact_count").eq("store_id", storeId),
        supabase.from("templates").select("id, name").eq("store_id", storeId).eq("type", "email"),
      ])
      setLists((listsRes.data ?? []).map((l) => ({ id: l.id, name: l.name, count: l.member_count })))
      setSegments((segmentsRes.data ?? []).map((s) => ({ id: s.id, name: s.name, count: s.contact_count })))
      setTemplates((templatesRes.data ?? []).map((t) => ({ id: t.id, name: t.name })))
    }

    fetchOptions()
  }, [storeId])

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    tags: [],
    abTest: false,
    subjectA: "",
    subjectB: "",
    abSplit: 50,
    abCheckHours: 4,
    recipientType: "list",
    listId: "",
    segmentId: "",
    excludeUnengaged: false,
    smartSending: false,
    templateId: "",
    subject: "",
    previewText: "",
    senderName: "",
    senderEmail: "",
  })

  function updateField<K extends keyof CampaignFormData>(
    key: K,
    value: CampaignFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      updateField("tags", [...formData.tags, tag])
    }
    setTagInput("")
  }

  function removeTag(tag: string) {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tag)
    )
  }

  function canAdvance(): boolean {
    if (currentStep === 0 && !formData.name.trim()) return false
    if (currentStep === 2 && !formData.subject.trim() && !formData.abTest)
      return false
    if (
      currentStep === 2 &&
      formData.abTest &&
      (!formData.subjectA.trim() || !formData.subjectB.trim())
    )
      return false
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

  function handleSendNow() {
    const confirmed = window.confirm("Enviar campanha para 0 contatos?")
    if (confirmed) {
      toast({ title: "Campanha enviada!", description: "Sua campanha foi enviada com sucesso." })
    }
  }

  function handleSchedule() {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de agendamento em desenvolvimento.",
    })
  }

  function handleSendTestEmail() {
    setShowTestEmailModal(false)
    setTestEmail("")
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade em desenvolvimento.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        {STEPS.map((label, index) => (
          <div key={label} className="flex items-center">
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
                  index + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  index <= currentStep ? "text-brand-600" : "text-gray-400"
                }`}
              >
                {label}
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
        {currentStep === 0 && (
          <StepInformacoes
            formData={formData}
            updateField={updateField}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={addTag}
            removeTag={removeTag}
          />
        )}
        {currentStep === 1 && (
          <StepDestinatarios formData={formData} updateField={updateField} lists={lists} segments={segments} />
        )}
        {currentStep === 2 && (
          <StepConteudo
            formData={formData}
            updateField={updateField}
            onSendTest={() => setShowTestEmailModal(true)}
            templates={templates}
          />
        )}
        {currentStep === 3 && (
          <StepRevisar
            formData={formData}
            onSendNow={handleSendNow}
            onSchedule={handleSchedule}
          />
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

      {/* Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Enviar email de teste
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email de destino
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTestEmailModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Send className="w-[18px] h-[18px]" />
                Enviar teste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Step 1: Informações ---------- */

function StepInformacoes({
  formData,
  updateField,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
}: {
  formData: CampaignFormData
  updateField: <K extends keyof CampaignFormData>(
    key: K,
    value: CampaignFormData[K]
  ) => void
  tagInput: string
  setTagInput: (v: string) => void
  addTag: () => void
  removeTag: (tag: string) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Informações da Campanha</h2>

      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nome da campanha <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Ex: Black Friday 2024"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-brand-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Digite uma tag e pressione Enter"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" />
            Adicionar
          </button>
        </div>
      </div>

      {/* A/B Test */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.abTest}
            onChange={(e) => updateField("abTest", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700">Teste A/B</span>
        </label>

        {formData.abTest && (
          <div className="space-y-4 pl-6 border-l-2 border-brand-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject A
                </label>
                <input
                  type="text"
                  value={formData.subjectA}
                  onChange={(e) => updateField("subjectA", e.target.value)}
                  placeholder="Variante A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject B
                </label>
                <input
                  type="text"
                  value={formData.subjectB}
                  onChange={(e) => updateField("subjectB", e.target.value)}
                  placeholder="Variante B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Divisão do teste
              </label>
              <input
                type="range"
                min={10}
                max={90}
                value={formData.abSplit}
                onChange={(e) => updateField("abSplit", Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                A: {formData.abSplit}% / B: {100 - formData.abSplit}%
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Enviar winner após X horas
              </label>
              <input
                type="number"
                min={1}
                value={formData.abCheckHours}
                onChange={(e) =>
                  updateField("abCheckHours", Number(e.target.value))
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Step 2: Destinatários ---------- */

function StepDestinatarios({
  formData,
  updateField,
  lists,
  segments,
}: {
  formData: CampaignFormData
  updateField: <K extends keyof CampaignFormData>(
    key: K,
    value: CampaignFormData[K]
  ) => void
  lists: SelectOption[]
  segments: SelectOption[]
}) {
  const selectedList = lists.find((l) => l.id === formData.listId)
  const selectedSegment = segments.find((s) => s.id === formData.segmentId)
  const contactCount =
    formData.recipientType === "list"
      ? selectedList?.count ?? 0
      : selectedSegment?.count ?? 0

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Destinatários</h2>

      {/* Recipient type */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="recipientType"
            checked={formData.recipientType === "list"}
            onChange={() => updateField("recipientType", "list")}
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
            checked={formData.recipientType === "segment"}
            onChange={() => updateField("recipientType", "segment")}
            className="w-4 h-4 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Enviar para Segmento
          </span>
        </label>
      </div>

      {/* Select */}
      {formData.recipientType === "list" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Selecionar lista
          </label>
          <select
            value={formData.listId}
            onChange={(e) => updateField("listId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Selecione uma lista</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.count ?? 0} contatos)
              </option>
            ))}
            {lists.length === 0 && (
              <option value="" disabled>Nenhuma lista disponível</option>
            )}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Selecionar segmento
          </label>
          <select
            value={formData.segmentId}
            onChange={(e) => updateField("segmentId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Selecione um segmento</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.count ?? 0} contatos)
              </option>
            ))}
            {segments.length === 0 && (
              <option value="" disabled>Nenhum segmento disponível</option>
            )}
          </select>
        </div>
      )}

      {/* Contact count badge */}
      <div
        className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
          contactCount === 0
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <Users className="w-[18px] h-[18px]" />
        Será enviado para {contactCount} contatos
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.excludeUnengaged}
            onChange={(e) =>
              updateField("excludeUnengaged", e.target.checked)
            }
            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700">
            Excluir contatos não engajados (não abriram email nos últimos 90
            dias)
          </span>
        </label>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.smartSending}
            onChange={(e) => updateField("smartSending", e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700">
            Smart Sending — Não enviar para quem recebeu email nas últimas 16
            horas
          </span>
        </label>
      </div>
    </div>
  )
}

/* ---------- Step 3: Conteúdo ---------- */

function StepConteudo({
  formData,
  updateField,
  onSendTest,
  templates,
}: {
  formData: CampaignFormData
  updateField: <K extends keyof CampaignFormData>(
    key: K,
    value: CampaignFormData[K]
  ) => void
  onSendTest: () => void
  templates: SelectOption[]
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Conteúdo do Email</h2>

      {/* Template select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Template
        </label>
        <select
          value={formData.templateId}
          onChange={(e) => updateField("templateId", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">Selecione um template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
          {templates.length === 0 && (
            <option value="" disabled>Nenhum template disponível</option>
          )}
        </select>
      </div>

      {/* Subject(s) */}
      {formData.abTest ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject A <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subjectA}
              onChange={(e) => updateField("subjectA", e.target.value)}
              placeholder="Assunto da variante A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject B <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subjectB}
              onChange={(e) => updateField("subjectB", e.target.value)}
              placeholder="Assunto da variante B"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>
      ) : (
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
      )}

      {/* Preview text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Preview text
        </label>
        <input
          type="text"
          value={formData.previewText}
          onChange={(e) => updateField("previewText", e.target.value)}
          placeholder="Texto de prévia do email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Texto que aparece após o subject no inbox
        </p>
      </div>

      {/* Sender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome do remetente
          </label>
          <input
            type="text"
            value={formData.senderName}
            onChange={(e) => updateField("senderName", e.target.value)}
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
            value={formData.senderEmail}
            onChange={(e) => updateField("senderEmail", e.target.value)}
            placeholder="contato@sualoja.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Test email button */}
      <button
        type="button"
        onClick={onSendTest}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Send className="w-[18px] h-[18px]" />
        Enviar email de teste
      </button>
    </div>
  )
}

/* ---------- Step 4: Revisar ---------- */

function StepRevisar({
  formData,
  onSendNow,
  onSchedule,
}: {
  formData: CampaignFormData
  onSendNow: () => void
  onSchedule: () => void
}) {
  const subject = formData.abTest
    ? `A: ${formData.subjectA || "—"} / B: ${formData.subjectB || "—"}`
    : formData.subject || "—"

  const sender =
    formData.senderName || formData.senderEmail
      ? `${formData.senderName} <${formData.senderEmail}>`
      : "Não configurado"

  const summaryItems = [
    { label: "Destinatários", value: "0 contatos" },
    { label: "Assunto", value: subject },
    { label: "Remetente", value: sender },
    { label: "Template", value: formData.templateId || "Não selecionado" },
    { label: "Teste A/B", value: formData.abTest ? "Sim" : "Não" },
    {
      label: "Smart Sending",
      value: formData.smartSending ? "Ativado" : "Desativado",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Revisar e Enviar</h2>

      <div className="grid grid-cols-2 gap-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {item.label}
            </p>
            <p className="text-sm font-medium text-gray-900 break-words">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onSendNow}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Send className="w-[18px] h-[18px]" />
          Enviar Agora
        </button>
        <button
          type="button"
          onClick={onSchedule}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-[18px] h-[18px]" />
          Agendar
        </button>
      </div>
    </div>
  )
}
