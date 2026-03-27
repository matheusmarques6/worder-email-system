"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, List, X, Trash2, Users } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ContactList } from "@/types"

export default function ListsPage() {
  const [lists, setLists] = useState<ContactList[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const { store } = useStore()

  const fetchLists = useCallback(async () => {
    if (!store?.id) return

    const supabase = createClient()
    setLoading(true)
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setLists(data as ContactList[])
    }
    setLoading(false)
  }, [store?.id])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  async function handleCreate() {
    if (!store?.id || !formName.trim()) return

    const supabase = createClient()
    setCreating(true)

    const { error } = await supabase.from("lists").insert({
      store_id: store.id,
      name: formName.trim(),
      description: formDescription.trim() || null,
    })

    setCreating(false)

    if (!error) {
      setShowModal(false)
      setFormName("")
      setFormDescription("")
      fetchLists()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar esta lista?")) return

    const supabase = createClient()
    await supabase.from("lists").delete().eq("id", id)
    setLists((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Listas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Nova Lista
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/5" />
            </div>
          ))}
        </div>
      ) : lists.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Descrição</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Membros</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Criado em</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((list) => (
                <tr key={list.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 font-medium">{list.name}</td>
                  <td className="px-6 py-3 text-gray-700">{list.description || "—"}</td>
                  <td className="px-6 py-3 text-gray-700">{list.member_count}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {format(new Date(list.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/audience/lists/${list.id}`}
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        <Users size={14} />
                        Ver membros
                      </Link>
                      <button
                        onClick={() => handleDelete(list.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <Trash2 size={14} />
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <List size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhuma lista criada
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Organize seus contatos em listas
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Nova Lista
            </button>
          </div>
        </div>
      )}

      {/* Modal: Nova Lista */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-gray-900">Nova Lista</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Newsletter"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Criando..." : "Criar Lista"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
