"use client"

import { CampaignWizard } from "@/components/campaigns/campaign-wizard"

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Nova Campanha</h1>
      <CampaignWizard storeId="" />
    </div>
  )
}
