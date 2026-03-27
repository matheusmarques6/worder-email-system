"use client"

import { useState, useEffect } from "react"
import { Plus, List, Trash2 } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { ContactList } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ListsPage() {
  const { store } = useStore()
  const [lists, setLists] = useState<ContactList[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")

  useEffect(() => {
    if (!store?.id) return
    fetchLists()
  }, [store?.id])

  async function fetchLists() {
    if (!store?.id) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })

    if (!error && data) setLists(data as ContactList[])
    setLoading(false)
  }

  async function handleCreate() {
    if (!store?.id || !newName.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from("lists").insert({
      store_id: store.id,
      name: newName.trim(),
      description: newDescription.trim() || null,
      member_count: 0,
    })

    if (error) {
      toast.error("Erro ao criar lista")
    } else {
      toast.success("Lista criada com sucesso")
      setNewName("")
      setNewDescription("")
      setShowCreate(false)
      fetchLists()
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("lists").delete().eq("id", id)
    if (error) {
      toast.error("Erro ao excluir lista")
    } else {
      toast.success("Lista excluída")
      setLists(lists.filter((l) => l.id !== id))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Listas</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Nova Lista
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Criar Nova Lista</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome da lista"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Criar
              </button>
              <button onClick={() => setShowCreate(false)} className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      ) : lists.length > 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Membros</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Criada em</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lists.map((list) => (
                <tr key={list.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{list.name}</td>
                  <td className="px-4 py-3 text-gray-500">{list.description ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{list.member_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDistanceToNow(new Date(list.created_at), { addSuffix: true, locale: ptBR })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(list.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
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
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">Nenhuma lista criada</h2>
            <p className="text-sm text-gray-500 mb-6">Crie listas para organizar seus contatos.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Nova Lista
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
