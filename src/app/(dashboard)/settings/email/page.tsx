"use client"

import { useState, useEffect } from "react"
import { Mail, Plus, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface Domain {
  id: string
  name: string
  status: string
}

export default function EmailSettingsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [newDomain, setNewDomain] = useState("")
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchDomains()
  }, [])

  async function fetchDomains() {
    setLoading(true)
    try {
      const res = await fetch("/api/domains")
      const data = (await res.json()) as { domains?: Domain[] }
      setDomains(data.domains ?? [])
    } catch {
      // ignore
    }
    setLoading(false)
  }

  async function handleAddDomain() {
    if (!newDomain.trim()) return
    setAdding(true)
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim() }),
      })

      if (res.ok) {
        toast.success("Domínio adicionado. Configure os registros DNS.")
        setNewDomain("")
        fetchDomains()
      } else {
        const error = (await res.json()) as { error?: string }
        toast.error(error.error ?? "Erro ao adicionar domínio")
      }
    } catch {
      toast.error("Erro ao adicionar domínio")
    }
    setAdding(false)
  }

  async function handleVerify(domainId: string) {
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      })

      if (res.ok) {
        toast.success("Verificação iniciada")
        fetchDomains()
      } else {
        toast.error("Erro ao verificar domínio")
      }
    } catch {
      toast.error("Erro ao verificar domínio")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-[24px] font-semibold text-gray-900 mb-6">Configurações de Email</h1>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Domínios de Envio</h2>
        <p className="text-sm text-gray-500 mb-4">
          Adicione e verifique domínios para enviar emails com seu próprio endereço.
        </p>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="seudominio.com.br"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
          />
          <button
            onClick={handleAddDomain}
            disabled={adding}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            Adicionar Domínio
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-100 rounded" />
            ))}
          </div>
        ) : domains.length > 0 ? (
          <div className="space-y-3">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{domain.name}</span>
                  {domain.status === "verified" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle size={12} /> Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Clock size={12} /> Pendente
                    </span>
                  )}
                </div>
                {domain.status !== "verified" && (
                  <button
                    onClick={() => handleVerify(domain.id)}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Verificar
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhum domínio configurado.</p>
        )}
      </div>
    </div>
  )
}
