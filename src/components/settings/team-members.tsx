"use client"

import { useState } from "react"
import { Users, UserPlus, Trash2, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  type StoreUser,
  type UserRole,
  ROLE_LABELS,
  ROLE_COLORS,
} from "@/types/roles"

interface TeamMembersProps {
  storeId: string
}

export function TeamMembers({ storeId }: TeamMembersProps) {
  const [members, setMembers] = useState<StoreUser[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer")

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: "Convite enviado!" })
    setInviteEmail("")
    setInviteRole("viewer")
    setShowInviteModal(false)
  }

  const handleRemove = (member: StoreUser) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${member.email} da equipe?`
    )
    if (!confirmed) return
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    toast({ title: "Membro removido" })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">
            Membros da Equipe
          </h3>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserPlus size={18} />
            Convidar Membro
          </button>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              <Users size={18} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Nenhum membro na equipe
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Convide membros para colaborar
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus size={18} />
              Convidar Membro
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de entrada
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {member.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{member.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[member.role]}`}
                      >
                        {ROLE_LABELS[member.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {member.accepted_at
                        ? formatDate(member.accepted_at)
                        : "Pendente"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleRemove(member)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Remover membro"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Convidar Membro
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Função
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="admin">{ROLE_LABELS.admin}</option>
                  <option value="editor">{ROLE_LABELS.editor}</option>
                  <option value="viewer">{ROLE_LABELS.viewer}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
