"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { CampaignReport } from "@/components/campaigns/campaign-report"
import { ClickMap } from "@/components/campaigns/click-map"

export default function CampaignReportPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [activeTab, setActiveTab] = useState<"report" | "clicks">("report")

  // For now, show placeholder campaign data
  const campaign = {
    id: campaignId,
    name: "Campanha",
    subject: null,
    status: "draft",
    sent_at: null,
    stats: null,
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "report"
              ? "bg-brand-50 text-brand-700 border border-brand-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Relatório
        </button>
        <button
          onClick={() => setActiveTab("clicks")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "clicks"
              ? "bg-brand-50 text-brand-700 border border-brand-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Mapa de Cliques
        </button>
      </div>

      {activeTab === "report" ? (
        <CampaignReport campaign={campaign} />
      ) : (
        <ClickMap campaignId={campaignId} />
      )}
    </div>
  )
}
