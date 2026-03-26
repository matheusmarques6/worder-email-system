"use client"

import { CampaignWizard } from "@/components/campaigns/campaign-wizard"
import { useStore } from "@/hooks/use-store"

export default function NewCampaignPage() {
  const { store, loading } = useStore()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-white border border-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Nova Campanha</h1>
      <CampaignWizard storeId={store?.id ?? ""} />
    </div>
  )
}
