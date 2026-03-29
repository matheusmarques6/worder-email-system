import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { campaignId, scheduledAt } = await request.json()

    if (!campaignId || !scheduledAt) {
      return NextResponse.json(
        { error: "campaignId and scheduledAt are required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify campaign exists and is in a schedulable state
    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("status")
      .eq("id", campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      return NextResponse.json(
        { error: "Only draft or scheduled campaigns can be scheduled" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("campaigns")
      .update({
        status: "scheduled",
        scheduled_at: scheduledAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign: data })
  } catch (err) {
    console.error("Schedule campaign error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
