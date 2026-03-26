"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CampaignReport } from "@/components/campaigns/campaign-report"
import { ClickMap } from "@/components/campaigns/click-map"
import { createClient } from "@/lib/supabase/client"

interface CampaignData {
  id: string
  name: string
  subject: string | null
  subject_b?: string | null
  status: string
  sent_at: string | null
  ab_test_enabled?: boolean
  stats: {
    sent: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed?: number
    revenue?: number
  } | null
}

export default function CampaignReportPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [activeTab, setActiveTab] = useState<"report" | "clicks">("report")
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchCampaign() {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, subject, subject_b, status, sent_at, ab_test_enabled, stats")
        .eq("id", campaignId)
        .single()

      setCampaign(data ?? {
        id: campaignId,
        name: "Campanha não encontrada",
        subject: null,
        status: "draft",
        sent_at: null,
        stats: null,
      })
      setLoading(false)
    }

    fetchCampaign()
  }, [campaignId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!campaign) return null

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
