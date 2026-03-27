"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft, Save, Download } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import type { EditorRef } from "react-email-editor"

const EmailEditor = dynamic(
  () => import("react-email-editor").then((mod) => mod.default),
  { ssr: false }
)

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const editorRef = useRef<EditorRef>(null)
  const [templateName, setTemplateName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [designToLoad, setDesignToLoad] = useState<Record<string, unknown> | null>(null)
  const { store } = useStore()

  // Fetch template data on mount
  useEffect(() => {
    if (!store?.id) return

    const supabase = createClient()

    async function fetchTemplate() {
      const { data, error } = await supabase
        .from("templates")
        .select("id, name, design_json, type")
        .eq("id", templateId)
        .eq("store_id", store!.id)
        .single()

      if (error || !data) {
        toast({ title: "Template não encontrado", variant: "destructive" })
        router.push("/templates")
        return
      }

      setTemplateName(data.name as string)

      if (data.design_json) {
        setDesignToLoad(data.design_json as Record<string, unknown>)
      }

      setLoading(false)
    }

    fetchTemplate()
  }, [store?.id, templateId, router])

  // Load design into editor once both are ready
  useEffect(() => {
    if (editorReady && designToLoad && editorRef.current?.editor) {
      editorRef.current.editor.loadDesign(designToLoad as never)
      setDesignToLoad(null)
    }
  }, [editorReady, designToLoad])

  const onEditorReady = useCallback(() => {
    setEditorReady(true)
  }, [])

  // Save template
  const handleSave = useCallback(() => {
    if (!store?.id || !editorRef.current?.editor) return

    setSaving(true)

    editorRef.current.editor.exportHtml(
      (data: { design: Record<string, unknown>; html: string }) => {
        const { design, html } = data

        const supabase = createClient()

        supabase
          .from("templates")
          .update({
            name: templateName,
            design_json: design,
            html,
            updated_at: new Date().toISOString(),
          })
          .eq("id", templateId)
          .eq("store_id", store!.id)
          .then(({ error }) => {
            if (error) {
              toast({
                title: "Erro ao salvar template",
                variant: "destructive",
              })
            } else {
              toast({ title: "Template salvo!" })
            }
            setSaving(false)
          })
      }
    )
  }, [store?.id, templateId, templateName])

  // Export HTML as file download
  const handleExportHtml = useCallback(() => {
    if (!editorRef.current?.editor) return

    editorRef.current.editor.exportHtml(
      (data: { design: Record<string, unknown>; html: string }) => {
        const blob = new Blob([data.html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${templateName || "template"}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast({ title: "HTML exportado com sucesso" })
      }
    )
  }, [templateName])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 flex-shrink-0">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Templates
          </Link>

          <div className="w-px h-6 bg-gray-200" />

          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-sm font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-0 px-1 py-0.5 hover:bg-gray-50 rounded transition-colors"
            placeholder="Nome do template"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHtml}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Exportar HTML
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* Unlayer Editor */}
      <div className="flex-1">
        <EmailEditor
          ref={editorRef}
          onReady={onEditorReady}
          minHeight="calc(100vh - 120px)"
          options={{
            locale: "pt-BR",
            features: {
              textEditor: {
                spellChecker: false,
              },
            },
            mergeTags: {
              first_name: {
                name: "Primeiro Nome",
                value: "{{first_name}}",
              },
              last_name: {
                name: "Sobrenome",
                value: "{{last_name}}",
              },
              email: {
                name: "Email",
                value: "{{email}}",
              },
              store_name: {
                name: "Nome da Loja",
                value: "{{store_name}}",
              },
              store_url: {
                name: "URL da Loja",
                value: "{{store_url}}",
              },
              order_number: {
                name: "Número do Pedido",
                value: "{{order_number}}",
              },
              order_total: {
                name: "Total do Pedido",
                value: "{{order_total}}",
              },
              product_name: {
                name: "Nome do Produto",
                value: "{{product_name}}",
              },
              product_price: {
                name: "Preço do Produto",
                value: "{{product_price}}",
              },
              discount_code: {
                name: "Código de Desconto",
                value: "{{discount_code}}",
              },
              unsubscribe_url: {
                name: "Link de Descadastro",
                value: "{{unsubscribe_url}}",
              },
            },
          }}
        />
      </div>
    </div>
  )
}
