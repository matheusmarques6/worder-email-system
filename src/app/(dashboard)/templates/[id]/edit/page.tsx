"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { EditorRef, EmailEditorProps } from "react-email-editor"

const EmailEditor = dynamic(
  () => import("react-email-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Carregando editor...</p>
      </div>
    ),
  }
)

export default function TemplateEditPage() {
  const params = useParams()
  const templateId = params.id as string
  const editorRef = useRef<EditorRef>(null)
  const [templateName, setTemplateName] = useState("")
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const designJsonRef = useRef<Record<string, unknown> | null>(null)

  useEffect(() => {
    async function loadTemplate() {
      const supabase = createClient()
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single()
      if (data) {
        setTemplateName(data.name || "")
        if (data.design_json) {
          designJsonRef.current = data.design_json as Record<string, unknown>
        }
        setLoaded(true)
      }
    }
    loadTemplate()
  }, [templateId])

  const onReady: EmailEditorProps["onReady"] = useCallback(() => {
    if (designJsonRef.current && editorRef.current?.editor) {
      editorRef.current.editor.loadDesign(designJsonRef.current as Parameters<typeof editorRef.current.editor.loadDesign>[0])
    }
  }, [])

  async function handleSave() {
    if (!editorRef.current?.editor) return
    setSaving(true)

    editorRef.current.editor.exportHtml(
      (htmlData: { html: string; design: Record<string, unknown> }) => {
        const saveToDb = async () => {
          const supabase = createClient()
          const { error } = await supabase
            .from("templates")
            .update({
              name: templateName,
              html: htmlData.html,
              design_json: htmlData.design as unknown as Record<string, unknown>,
              updated_at: new Date().toISOString(),
            })
            .eq("id", templateId)

          if (error) {
            toast.error("Erro ao salvar template")
          } else {
            toast.success("Template salvo com sucesso")
          }
          setSaving(false)
        }
        saveToDb()
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent"
            placeholder="Nome do template"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </header>
      <div className="flex-1">
        {loaded && (
          <EmailEditor
            ref={editorRef}
            onReady={onReady}
            minHeight="100%"
            options={{
              appearance: {
                theme: "modern_light",
              },
              features: {
                stockImages: { enabled: true, safeSearch: true },
              },
            }}
          />
        )}
      </div>
    </div>
  )
}
