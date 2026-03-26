"use client";

import { useState } from "react";
import { Store, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { createClient } from "@/lib/supabase/client";

interface StepConnectShopifyProps {
  onComplete: () => void;
}

export function StepConnectShopify({ onComplete }: StepConnectShopifyProps) {
  const { store } = useStore();
  const [domain, setDomain] = useState("");
  const [connecting, setConnecting] = useState(false);

  const isConnected = !!store?.shopify_domain;

  const handleConnect = async () => {
    if (!domain.trim()) {
      toast.error("Insira o domínio da sua loja Shopify.");
      return;
    }

    if (!store) return;

    setConnecting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stores")
        .update({ shopify_domain: domain.trim() })
        .eq("id", store.id);

      if (error) {
        toast.error("Erro ao conectar a loja.");
      } else {
        toast.success("Loja Shopify conectada com sucesso!");
        onComplete();
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <Store size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Conectar sua loja Shopify
          </h2>
        </div>
      </div>
      <p className="text-[14px] text-gray-500 mb-6">
        Sincronize produtos, clientes e pedidos automaticamente.
      </p>

      {isConnected ? (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 size={18} className="text-green-600" />
          <span className="text-[14px] text-green-700 font-medium">
            Conectado
          </span>
          <span className="text-[14px] text-green-600 ml-1">
            — {store.shopify_domain}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-1.5">
              Domínio da loja Shopify
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="minha-loja.myshopify.com"
              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 text-[14px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
          >
            {connecting ? "Conectando..." : "Conectar Shopify"}
          </button>
        </div>
      )}
    </div>
  );
}
