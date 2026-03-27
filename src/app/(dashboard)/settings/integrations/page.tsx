import { ShopifyConnect } from "@/components/settings/shopify-connect";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Integrações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas integrações</p>
      </div>
      <ShopifyConnect />
    </div>
  );
}
