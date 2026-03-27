"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Search, MoreVertical, Copy, Trash2, Pencil } from "lucide-react"

interface TemplateItem {
  id: string
  name: string
  category: string
  thumbnail_url: string | null
  created_at: string
}

const categories = ["Todos", "E-commerce", "Welcome", "Abandono", "Pós-compra", "Newsletter", "Custom"] as const

interface TemplateGalleryProps {
  templates: TemplateItem[]
  onDelete?: (id: string) => void
  onClone?: (id: string) => void
}

export function TemplateGallery({ templates, onDelete, onClone }: TemplateGalleryProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("Todos")
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "Todos" || t.category.toLowerCase() === activeCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
        <div className="mb-4 rounded-lg bg-gray-100 p-3">
          <Mail size={48} className="text-gray-400" />
        </div>
        <p className="text-lg text-gray-600">Nenhum template criado</p>
        <p className="mb-4 text-sm text-gray-400">Crie seu primeiro template de email</p>
        <Link href="/templates/new" className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors">
          Criar Template
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Buscar templates..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <div key={template.id} className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="relative flex h-48 items-center justify-center bg-gray-100">
              {template.thumbnail_url ? (
                <img src={template.thumbnail_url} alt={template.name} className="h-full w-full object-cover" />
              ) : (
                <Mail size={48} className="text-gray-300" />
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Link href={`/templates/${template.id}/edit`}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium rounded-lg px-3 py-1.5 text-sm flex items-center gap-1">
                  <Pencil size={14} /> Editar
                </Link>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  <span className="inline-block mt-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 text-xs font-medium">{template.category}</span>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === template.id ? null : template.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === template.id && (
                    <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <Link href={`/templates/${template.id}/edit`} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Pencil size={14} /> Editar
                      </Link>
                      <button onClick={() => { onClone?.(template.id); setOpenMenu(null) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Copy size={14} /> Clonar
                      </button>
                      <button onClick={() => { onDelete?.(template.id); setOpenMenu(null) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-gray-50">
                        <Trash2 size={14} /> Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">{new Date(template.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Search size={48} className="mb-4 text-gray-300" />
          <p className="text-gray-500">Nenhum template encontrado</p>
        </div>
      )}
    </div>
  )
}
