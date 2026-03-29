import { NextRequest, NextResponse } from "next/server"
import {
  getDashboardMetrics,
  getEmailsOverTime,
  getTopCampaigns,
} from "@/lib/analytics/metrics"

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("store_id")
    if (!storeId) {
      return NextResponse.json({ error: "store_id is required" }, { status: 400 })
    }

    const daysParam = request.nextUrl.searchParams.get("days")
    const days = daysParam ? parseInt(daysParam, 10) : 30

    const [metrics, emailsOverTime, topCampaigns] = await Promise.all([
      getDashboardMetrics(storeId, days),
      getEmailsOverTime(storeId, days),
      getTopCampaigns(storeId),
    ])

    return NextResponse.json({
      metrics,
      emails_over_time: emailsOverTime,
      top_campaigns: topCampaigns,
    })
  } catch (err) {
    console.error("Dashboard analytics error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
