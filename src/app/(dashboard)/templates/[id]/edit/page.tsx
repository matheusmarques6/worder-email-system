"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import type { EmailEditorHandle } from "@/components/editor/email-editor"

const EmailEditorWrapper = dynamic(
  () => import("@/components/editor/email-editor").then((mod) => mod.EmailEditorWrapper),
  { ssr: false, loading: () => <div className="flex-1 bg-gray-50" /> }
)

export default function EditTemplatePage() {
  const params = useParams()
  const editorRef = useRef<EmailEditorHandle>(null)
  const [template, setTemplate] = useState<Record<string, unknown> | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [showTest, setShowTest] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase.from("templates").select("*").eq("id", params.id).single()
      if (data) { setTemplate(data); setName(data.name) }
    }
    fetch()
  }, [params.id])

  const handleSave = useCallback(async (html: string, designJson: Record<string, unknown>) => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("templates").update({ name, html, design_json: designJson, updated_at: new Date().toISOString() }).eq("id", params.id)
    if (error) alert("Erro ao salvar")
    else alert("Template salvo!")
    setSaving(false)
  }, [name, params.id])

  const handleSendTest = useCallback(() => {
    if (!testEmail.trim()) return
    setSendingTest(true)
    editorRef.current?.getHtml(async (html) => {
      try {
        await fetch("/api/campaigns/test", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testEmail.trim(), subject: `[TESTE] ${name}`, html }),
        })
        alert(`Teste enviado para ${testEmail}`)
        setShowTest(false); setTestEmail("")
      } catch { alert("Erro ao enviar teste") }
      setSendingTest(false)
    })
  }, [testEmail, name])

  if (!template) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <Link href="/templates" className="text-gray-500 hover:text-gray-700 p-1"><ArrowLeft size={16} /></Link>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="border-none bg-transparent text-sm font-medium text-gray-900 outline-none" placeholder="Nome do template" />
        </div>
        <div className="flex items-center gap-2">
          {showTest ? (
            <div className="flex items-center gap-2">
              <input type="email" placeholder="email@teste.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendTest(); if (e.key === "Escape") setShowTest(false) }}
                className="h-8 w-56 rounded-md border border-gray-300 px-3 text-sm focus:border-brand-500 focus:outline-none" autoFocus />
              <button onClick={handleSendTest} disabled={sendingTest}
                className="bg-white border border-gray-300 text-gray-700 font-medium rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50">
                {sendingTest ? "Enviando..." : "Enviar"}
              </button>
              <button onClick={() => setShowTest(false)} className="text-gray-500 hover:text-gray-700 text-sm">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setShowTest(true)} className="bg-white border border-gray-300 text-gray-700 font-medium rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-1">
              <Send size={14} /> Enviar Teste
            </button>
          )}
          <button disabled={saving} onClick={() => editorRef.current?.exportHtml()}
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-1.5 text-sm disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>
      <div className="flex-1">
        <EmailEditorWrapper ref={editorRef} designJson={template.design_json as Record<string, unknown> | undefined} onSave={handleSave} height="100%" />
      </div>
    </div>
  )
}
