"use client";

import { useStore } from "@/hooks/use-store";
import { ShopifyConnect } from "@/components/settings/shopify-connect";
import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationsPage() {
  const { store, loading } = useStore();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Integrações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Conecte suas ferramentas para sincronizar dados automaticamente.
        </p>
      </div>

      <ShopifyConnect
        storeId={store?.id || ""}
        shopifyDomain={store?.shopify_domain || null}
        lastSyncAt={null}
      />
    </div>
  );
}
