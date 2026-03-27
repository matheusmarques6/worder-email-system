"use client"

import { useState } from "react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"

interface DnsRecord {
  type: string
  name: string
  value: string
  status: "verified" | "pending"
}

export default function EmailSettingsPage() {
  const { store } = useStore()
  const [domain, setDomain] = useState("")
  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([])
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleVerifyDomain() {
    if (!domain.trim()) return
    setVerifying(true)

    // Simulated DNS records for domain verification
    setDnsRecords([
      {
        type: "TXT",
        name: `_convertfy.${domain}`,
        value: "convertfy-verification=abc123",
        status: "pending",
      },
      {
        type: "CNAME",
        name: `mail.${domain}`,
        value: "send.convertfy.com",
        status: "pending",
      },
      {
        type: "TXT",
        name: domain,
        value: "v=spf1 include:convertfy.com ~all",
        status: "pending",
      },
    ])
    setVerifying(false)
  }

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Configurações de Email</h1>
      </div>

      <div className="space-y-6">
        {/* Domain verification card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Domínio de Envio</h2>

          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">Domínio</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="seudominio.com.br"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <button
              onClick={handleVerifyDomain}
              disabled={verifying || !domain.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {dnsRecords.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Tipo</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Nome</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Valor</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dnsRecords.map((record, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="px-4 py-2 font-mono text-gray-900">{record.type}</td>
                      <td className="px-4 py-2 font-mono text-gray-700 text-xs break-all">
                        {record.name}
                      </td>
                      <td className="px-4 py-2 font-mono text-gray-700 text-xs break-all">
                        {record.value}
                      </td>
                      <td className="px-4 py-2">
                        {record.status === "verified" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                            Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Default sender card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Remetente Padrão</h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do remetente
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Sua Loja"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email do remetente
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="contato@seudominio.com.br"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
