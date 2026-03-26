"use client"

import { useParams } from "next/navigation"
import { CampaignReport } from "@/components/campaigns/campaign-report"

export default function CampaignReportPage() {
  const params = useParams()
  const campaignId = params.id as string

  // For now, show placeholder campaign data
  const campaign = {
    id: campaignId,
    name: "Campanha",
    subject: null,
    status: "draft",
    sent_at: null,
    stats: null,
  }

  return <CampaignReport campaign={campaign} />
}
