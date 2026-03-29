import { NextRequest, NextResponse } from "next/server"
import { getCampaignReport } from "@/lib/analytics/metrics"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 })
    }

    const report = await getCampaignReport(id)

    return NextResponse.json({ report })
  } catch (err) {
    console.error("Campaign report error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
