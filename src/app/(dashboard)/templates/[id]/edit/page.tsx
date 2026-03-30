"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Template } from "@/types"
import { Editor } from "@/components/email-builder/Editor"
import { renderEmailToHtml } from "@/lib/email-builder/renderer"
import type { EmailTemplate } from "@/lib/email-builder/types"

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTemplate() {
      const supabase = createClient()
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("id", params.id)
        .single()

      if (data) {
        setTemplate(data as Template)
      } else {
        toast.error("Template não encontrado")
        router.push("/templates")
      }
      setLoading(false)
    }

    fetchTemplate()
  }, [params.id, router])

  const handleSave = useCallback(
    async (emailTemplate: EmailTemplate, html: string) => {
      const supabase = createClient()

      // Use the rendered HTML passed from the editor (or render if empty)
      const finalHtml = html || renderEmailToHtml(emailTemplate)

      const { error } = await supabase
        .from("templates")
        .update({
          html: finalHtml,
          design_json: emailTemplate as unknown as Record<string, unknown>,
          subject: emailTemplate.root.data.subject || template?.subject || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        toast.error("Erro ao salvar template")
      } else {
        toast.success("Template salvo!")
      }
    },
    [params.id, template?.subject]
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F26B2A] border-t-transparent" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Template não encontrado</p>
          <Link href="/templates" className="text-[#F26B2A] hover:underline mt-2 inline-block">
            Voltar para templates
          </Link>
        </div>
      </div>
    )
  }

  // Convert stored design_json back to EmailTemplate format
  const initialTemplate = template.design_json as unknown as EmailTemplate | undefined

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Mini header */}
      <div className="flex h-10 items-center border-b border-gray-200 bg-gray-50 px-4">
        <Link
          href="/templates"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={14} />
          Voltar para Templates
        </Link>
        <span className="mx-3 text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-900">{template.name}</span>
      </div>

      {/* Editor takes full remaining space */}
      <div className="flex-1 overflow-hidden">
        <Editor
          initialTemplate={initialTemplate || undefined}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
