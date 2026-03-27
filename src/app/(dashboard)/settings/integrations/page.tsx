"use client"

import { useState, useEffect } from "react"
import { Store, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function IntegrationsPage() {
  const { store } = useStore()
  const [shopifyDomain, setShopifyDomain] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [shopInput, setShopInput] = useState("")

  useEffect(() => {
    if (!store?.id) return

    async function fetchStore() {
      const supabase = createClient()
      const { data } = await supabase
        .from("stores")
        .select("shopify_domain, shopify_access_token")
        .eq("id", store!.id)
        .single()

      if (data) {
        setShopifyDomain((data.shopify_domain as string) ?? "")
        setIsConnected(!!(data.shopify_domain && data.shopify_access_token))
      }
      setLoading(false)
    }

    fetchStore()
  }, [store?.id])

  function handleConnectShopify() {
    if (!shopInput.trim()) {
      toast.error("Insira o domínio da loja Shopify")
      return
    }
    const shop = shopInput.includes(".myshopify.com")
      ? shopInput.trim()
      : `${shopInput.trim()}.myshopify.com`
    window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(shop)}`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-[24px] font-semibold text-gray-900 mb-6">Integrações</h1>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <Store size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[18px] font-semibold text-gray-900">Shopify</h2>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle size={12} /> Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  <XCircle size={12} /> Desconectado
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Conecte sua loja Shopify para sincronizar produtos, clientes e pedidos automaticamente.
            </p>

            {isConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Loja conectada: <span className="font-medium">{shopifyDomain}</span>
                </p>
                <button className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                  <RefreshCw size={16} />
                  Sincronizar Dados
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="sua-loja.myshopify.com"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
                />
                <button
                  onClick={handleConnectShopify}
                  className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Conectar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
