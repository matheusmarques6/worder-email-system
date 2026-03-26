"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link2, Check, ExternalLink } from "lucide-react";

interface ShopifyConnectProps {
  storeId: string;
  shopifyDomain: string | null;
  lastSyncAt: string | null;
}

export function ShopifyConnect({
  storeId,
  shopifyDomain,
  lastSyncAt,
}: ShopifyConnectProps) {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    if (!domain) {
      toast.error("Informe o domínio da loja Shopify.");
      return;
    }

    setLoading(true);
    const sanitized = domain
      .replace("https://", "")
      .replace("http://", "")
      .replace(/\/$/, "");

    window.location.href = `/api/auth/shopify?shop=${sanitized}&store_id=${storeId}`;
  };

  const isConnected = !!shopifyDomain;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <Link2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shopify</h3>
            <p className="text-sm text-gray-500">
              Sincronize clientes, pedidos e produtos
            </p>
          </div>
        </div>
        {isConnected ? (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="mr-1 h-3 w-3" />
            Conectado
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
            Desconectado
          </Badge>
        )}
      </div>

      {isConnected ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ExternalLink className="h-4 w-4" />
            <span>{shopifyDomain}</span>
          </div>
          {lastSyncAt && (
            <p className="text-xs text-gray-400">
              Último sync:{" "}
              {new Date(lastSyncAt).toLocaleString("pt-BR")}
            </p>
          )}
          <Button variant="secondary" size="sm">
            Sincronizar agora
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Domínio da loja
            </Label>
            <Input
              placeholder="minha-loja.myshopify.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Ex: minha-loja.myshopify.com
            </p>
          </div>
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "Conectando..." : "Conectar Shopify"}
          </Button>
        </div>
      )}
    </div>
  );
}
