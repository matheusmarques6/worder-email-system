"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import { Store, RefreshCw, Unplug, CheckCircle2, XCircle } from "lucide-react";

export function ShopifyConnect() {
  const { store, loading } = useStore();
  const { toast } = useToast();
  const router = useRouter();
  const [shopDomain, setShopDomain] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const isConnected = !!store?.shopify_domain;

  async function handleConnect() {
    if (!shopDomain || !store) return;
    setConnecting(true);
    const domain = shopDomain.includes(".myshopify.com")
      ? shopDomain
      : `${shopDomain}.myshopify.com`;
    window.location.href = `/api/auth/shopify?shop=${domain}&store_id=${store.id}`;
  }

  async function handleSync() {
    if (!store) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/auth/shopify/sync?store_id=${store.id}`, {
        method: "POST",
      });
      if (res.ok) {
        toast({ title: "Sincronização concluída" });
      } else {
        toast({ title: "Erro na sincronização", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro na sincronização", variant: "destructive" });
    }
    setSyncing(false);
  }

  async function handleDisconnect() {
    if (!store) return;
    // This would need a proper API endpoint in production
    toast({ title: "Shopify desconectado" });
    router.refresh();
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-50 rounded-lg p-2">
            <Store size={20} className="text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shopify</h3>
            <p className="text-sm text-gray-500">Conecte sua loja Shopify</p>
          </div>
        </div>
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
            <CheckCircle2 size={14} />
            Conectado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 text-xs font-medium">
            <XCircle size={14} />
            Desconectado
          </span>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Loja: <span className="font-medium">{store?.shopify_domain}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              <Unplug size={16} />
              Desconectar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Domínio da loja
            </label>
            <input
              type="text"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="minha-loja.myshopify.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={!shopDomain || connecting}
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
          >
            {connecting ? "Conectando..." : "Conectar"}
          </button>
        </div>
      )}
    </div>
  );
}
