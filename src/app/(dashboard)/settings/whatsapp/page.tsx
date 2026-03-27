"use client"

import { useState } from "react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"

export default function WhatsAppSettingsPage() {
  const { store } = useStore()
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [verifyToken, setVerifyToken] = useState("")
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSave() {
    if (!store?.id) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from("stores")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id)

    setSaving(false)
  }

  async function handleTestConnection() {
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      setTestResult({ success: false, message: "Preencha o Phone Number ID e Access Token." })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (response.ok) {
        setTestResult({ success: true, message: "Conexão estabelecida com sucesso!" })
      } else {
        setTestResult({ success: false, message: "Falha na conexão. Verifique suas credenciais." })
      }
    } catch {
      setTestResult({ success: false, message: "Erro ao testar conexão. Tente novamente." })
    }

    setTesting(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">WhatsApp</h1>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Configuração</h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="Seu Phone Number ID do WhatsApp"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Token de acesso permanente"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Token de verificação do webhook"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {testResult && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              testResult.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {testResult.message}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? "Testando..." : "Testar Conexão"}
          </button>
        </div>
      </div>
    </div>
  )
}
