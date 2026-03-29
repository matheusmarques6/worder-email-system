"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Mail, Search, MoreVertical, Copy, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import type { Template } from "@/types"

export default function TemplatesPage() {
  const { store, loading: storeLoading } = useStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    async function fetchTemplates() {
      if (!store) return
      const supabase = createClient()
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })

      setTemplates((data as Template[]) || [])
      setLoading(false)
    }

    if (!storeLoading && store) {
      fetchTemplates()
    }
    if (!storeLoading && !store) {
      setLoading(false)
    }
  }, [store, storeLoading])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("templates").delete().eq("id", id)
    if (error) {
      toast.error("Erro ao deletar template")
      return
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    toast.success("Template deletado")
  }

  const handleClone = async (id: string) => {
    const supabase = createClient()
    const template = templates.find((t) => t.id === id)
    if (!template) return

    const { data, error } = await supabase
      .from("templates")
      .insert({
        store_id: template.store_id,
        name: `${template.name} (cópia)`,
        category: template.category,
        subject: template.subject,
        html: template.html,
        design_json: template.design_json,
        is_prebuilt: false,
      })
      .select()
      .single()

    if (error) {
      toast.error("Erro ao duplicar template")
      return
    }
    setTemplates((prev) => [data as Template, ...prev])
    toast.success("Template duplicado")
  }

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    if (activeTab === "salvos") return matchesSearch && !t.is_prebuilt
    if (activeTab === "predefinidos") return matchesSearch && t.is_prebuilt
    return matchesSearch
  })

  if (storeLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <Skeleton className="h-48 w-full rounded-b-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <Link href="/templates/new">
          <Button className="bg-[#F26B2A] hover:bg-[#d95d24] text-white">
            <Plus size={18} className="mr-2" />
            Novo Template
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="salvos">Salvos</TabsTrigger>
            <TabsTrigger value="predefinidos">Pré-definidos</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Buscar templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
              <div className="mb-4 rounded-lg bg-gray-100 p-3">
                <Mail size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nenhum template
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Crie seu primeiro template de email!
              </p>
              <Link href="/templates/new" className="mt-4">
                <Button className="bg-[#F26B2A] hover:bg-[#d95d24] text-white">
                  <Plus size={18} className="mr-2" />
                  Criar Template
                </Button>
              </Link>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search size={48} className="mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum template encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100">
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Mail size={48} className="text-gray-300" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link href={`/templates/${template.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          <Pencil size={14} className="mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {template.name}
                        </p>
                        {template.category && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs"
                          >
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/templates/${template.id}/edit`}>
                              <Pencil size={14} className="mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleClone(template.id)}
                          >
                            <Copy size={14} className="mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
