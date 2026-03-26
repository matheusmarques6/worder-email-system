"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { toast } from "sonner"
import {
  ArrowLeft,
  Copy,
  Check,
  Eye,
  Code,
  BarChart3,
  Users,
  MousePointer,
  Percent,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import FormBuilder, { type FormConfig } from "@/components/forms/form-builder"

interface Form {
  id: string
  store_id: string
  name: string
  type: "popup" | "embedded" | "landing"
  status: "active" | "inactive"
  config: FormConfig
  submissions_count: number
  conversion_rate: number
  created_at: string
  updated_at: string
}

const typeLabels: Record<Form["type"], string> = {
  popup: "Popup",
  embedded: "Embedded",
  landing: "Landing Page",
}

const typeColors: Record<Form["type"], string> = {
  popup: "bg-amber-100 text-amber-800",
  embedded: "bg-blue-100 text-blue-800",
  landing: "bg-green-100 text-green-800",
}

function generateEmbedCode(formId: string, config: FormConfig, formType: Form["type"]): string {
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

export default function FormDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState<FormConfig>({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonColor: "#F97316",
    successMessage: "",
    fields: [],
  })

  const formId = params.id as string

  const fetchForm = useCallback(async () => {
    if (!store) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .eq("store_id", store.id)
      .single()

    if (error || !data) {
      toast.error("Formul\u00e1rio n\u00e3o encontrado")
      router.push("/forms")
      return
    }

    const formData = data as Form
    setForm(formData)
    setConfig(formData.config)
    setLoading(false)
  }, [store, formId, router])

  useEffect(() => {
    if (!storeLoading && store) {
      fetchForm()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [storeLoading, store, fetchForm])

  const handleSave = async () => {
    if (!store || !form) return

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("forms")
      .update({ config, updated_at: new Date().toISOString() })
      .eq("id", form.id)
      .eq("store_id", store.id)

    if (error) {
      toast.error("Erro ao salvar formul\u00e1rio")
    } else {
      toast.success("Formul\u00e1rio salvo com sucesso!")
    }
    setSaving(false)
  }

  const handleToggleStatus = async () => {
    if (!store || !form) return

    const newStatus = form.status === "active" ? "inactive" : "active"
    const supabase = createClient()
    const { error } = await supabase
      .from("forms")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", form.id)
      .eq("store_id", store.id)

    if (error) {
      toast.error("Erro ao alterar status")
      return
    }

    setForm({ ...form, status: newStatus })
    toast.success(newStatus === "active" ? "Formul\u00e1rio ativado!" : "Formul\u00e1rio desativado!")
  }

  const handleCopyEmbed = async () => {
    if (!form) return
    const code = generateEmbedCode(form.id, config, form.type)
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("C\u00f3digo copiado!")
  }

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!form) {
    return null
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{form.name}</h1>
            <Badge
              variant="secondary"
              className={form.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
            >
              {form.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            <Badge variant="secondary" className={typeColors[form.type]}>
              {typeLabels[form.type]}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-toggle" className="text-sm text-gray-600">
                {form.status === "active" ? "Ativo" : "Inativo"}
              </Label>
              <Switch
                id="status-toggle"
                checked={form.status === "active"}
                onCheckedChange={handleToggleStatus}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor" className="gap-2">
            <Eye className="h-[18px] w-[18px]" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2">
            <Code className="h-[18px] w-[18px]" />
            C\u00f3digo
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-[18px] w-[18px]" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Editor tab */}
        <TabsContent value="editor" className="mt-6">
          <FormBuilder
            config={config}
            onChange={setConfig}
            formType={form.type}
          />
        </TabsContent>

        {/* Code tab */}
        <TabsContent value="code" className="mt-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">C\u00f3digo de Incorpora\u00e7\u00e3o</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cole este c\u00f3digo no HTML do seu site para exibir o formul\u00e1rio
                </p>
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
              value={generateEmbedCode(form.id, config, form.type)}
              rows={12}
              className="font-mono text-xs bg-gray-50"
            />
          </div>
        </TabsContent>

        {/* Analytics tab */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
                  <Eye className="h-[18px] w-[18px] text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visualiza\u00e7\u00f5es</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {form.submissions_count > 0
                      ? Math.round(form.submissions_count / (form.conversion_rate / 100 || 1)).toLocaleString("pt-BR")
                      : "0"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-50">
                  <Users className="h-[18px] w-[18px] text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submiss\u00f5es</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {form.submissions_count.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50">
                  <Percent className="h-[18px] w-[18px] text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taxa de Convers\u00e3o</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {form.conversion_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart placeholder */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Submiss\u00f5es ao longo do tempo
            </h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">
                  Os dados do gr\u00e1fico ser\u00e3o exibidos quando houver submiss\u00f5es suficientes
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
