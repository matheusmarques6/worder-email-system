"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import { Globe, Copy, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
}

interface DomainInfo {
  name: string;
  verified: boolean;
  records: DnsRecord[];
  status: string;
}

export function DomainConfig() {
  const { store, loading } = useStore();
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [fetching, setFetching] = useState(false);

  async function fetchDomain() {
    if (!store) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/domains?store_id=${store.id}`);
      const data = await res.json();
      if (data.domain) {
        setDomainInfo(data.domain);
      }
    } catch {
      // Domain not configured yet
    }
    setFetching(false);
  }

  useEffect(() => {
    if (store?.id) {
      fetchDomain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.id]);

  async function handleAddDomain() {
    if (!domain || !store) return;
    setAdding(true);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, store_id: store.id }),
      });
      if (res.ok) {
        toast({ title: "Domínio adicionado" });
        await fetchDomain();
      } else {
        const err = await res.json();
        toast({ title: "Erro ao adicionar domínio", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao adicionar domínio", variant: "destructive" });
    }
    setAdding(false);
  }

  async function handleVerify() {
    if (!store) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: store.id }),
      });
      const data = await res.json();
      if (data.verified) {
        toast({ title: "Domínio verificado com sucesso!" });
      } else {
        toast({ title: "Domínio ainda não verificado", description: `Status: ${data.status}`, variant: "destructive" });
      }
      await fetchDomain();
    } catch {
      toast({ title: "Erro ao verificar", variant: "destructive" });
    }
    setVerifying(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  }

  if (loading || fetching) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-brand-50 rounded-lg p-2">
          <Globe size={20} className="text-brand-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Domínio de Envio</h3>
          <p className="text-sm text-gray-500">Configure o domínio para envio de emails</p>
        </div>
      </div>

      {domainInfo ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Domínio: <span className="font-medium">{domainInfo.name}</span>
            </p>
            {domainInfo.verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
                <CheckCircle2 size={14} />
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                <XCircle size={14} />
                Pendente
              </span>
            )}
          </div>

          {domainInfo.records.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Valor</th>
                    <th className="px-4 py-3 text-right">Copiar</th>
                  </tr>
                </thead>
                <tbody>
                  {domainInfo.records.map((record, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-mono text-xs">{record.type}</td>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[200px]">{record.name}</td>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[300px]">{record.value}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => copyToClipboard(record.value)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!domainInfo.verified && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={16} className={verifying ? "animate-spin" : ""} />
              {verifying ? "Verificando..." : "Verificar DNS"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Domínio
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="mail.suaempresa.com.br"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleAddDomain}
            disabled={!domain || adding}
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
          >
            {adding ? "Adicionando..." : "Adicionar Domínio"}
          </button>
        </div>
      )}
    </div>
  );
}
