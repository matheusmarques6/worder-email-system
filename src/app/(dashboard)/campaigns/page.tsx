"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Mail } from "lucide-react"
import CampaignTable from "@/components/campaigns/campaign-table"
import type { CampaignRow } from "@/components/campaigns/campaign-table"
import { cn } from "@/lib/utils"

// Tab definitions for filtering campaigns
const tabs = [
  { key: "all", label: "Todas" },
  { key: "sent", label: "Enviadas" },
  { key: "scheduled", label: "Agendadas" },
  { key: "draft", label: "Rascunhos" },
] as const

type TabKey = (typeof tabs)[number]["key"]

// Status filter map for each tab
const statusFilterMap: Record<TabKey, CampaignRow["status"][] | null> = {
  all: null,
  sent: ["sent"],
  scheduled: ["scheduled"],
  draft: ["draft"],
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all")

  // Empty array for now — will be replaced with real data later
  const campaigns: CampaignRow[] = []

  // Filter campaigns based on the active tab
  const filteredCampaigns =
    statusFilterMap[activeTab] === null
      ? campaigns
      : campaigns.filter((c) => statusFilterMap[activeTab]!.includes(c.status))

  // Handlers (will connect to server actions later)
  const handleDelete = useCallback((id: string) => {
    // TODO: call server action to delete campaign
    console.log("Delete campaign:", id)
  }, [])

  const handleDuplicate = useCallback((id: string) => {
    // TODO: call server action to duplicate campaign
    console.log("Duplicate campaign:", id)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Campanhas</h1>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Nova Campanha
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.key
                ? "bg-brand-50 text-brand-700 border border-brand-200"
                : "text-gray-600 hover:bg-gray-100 border border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content: table or empty state */}
      {filteredCampaigns.length > 0 ? (
        <CampaignTable
          campaigns={filteredCampaigns}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Mail size={48} className="text-gray-300 mb-4" />
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">
              Nenhuma campanha criada
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Crie e envie seu primeiro email!
            </p>
            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Nova Campanha
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
