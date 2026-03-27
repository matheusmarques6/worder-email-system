"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { TemplateGallery } from "@/components/editor/template-gallery"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; category: string; thumbnail_url: string | null; created_at: string; store_id: string; html: string | null; design_json: Record<string, unknown> | null; subject: string | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).single()
      if (!store) return
      const { data } = await supabase.from("templates").select("*").eq("store_id", store.id).order("created_at", { ascending: false })
      if (data) setTemplates(data)
      setLoading(false)
    }
    fetch()
  }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("templates").delete().eq("id", id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const handleClone = async (id: string) => {
    const supabase = createClient()
    const t = templates.find((t) => t.id === id)
    if (!t) return
    const { data } = await supabase.from("templates").insert({ store_id: t.store_id, name: `${t.name} (cópia)`, category: t.category, subject: t.subject, html: t.html, design_json: t.design_json }).select().single()
    if (data) setTemplates((prev) => [data, ...prev])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <Link href="/templates/new" className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors flex items-center gap-2">
          <Plus size={16} /> Criar Template
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="h-48 w-full bg-gray-200 animate-pulse rounded-t-lg" />
              <div className="p-4 space-y-2"><div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" /><div className="h-3 w-1/4 bg-gray-200 animate-pulse rounded" /></div>
            </div>
          ))}
        </div>
      ) : (
        <TemplateGallery templates={templates} onDelete={handleDelete} onClone={handleClone} />
      )}
    </div>
  )
}
