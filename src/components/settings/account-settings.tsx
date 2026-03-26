"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export function AccountSettings() {
  const [name, setName] = useState("")
  const [email] = useState("usuario@exemplo.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: "Alterações salvas!" })
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Minha Conta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Para alterar o email, entre em contato com o suporte
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Alterar Senha
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  )
}
