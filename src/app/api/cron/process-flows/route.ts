import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { processNode } from "@/lib/flows/engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = createAdminClient()

    // Find waiting executions that are ready to advance
    const { data, error } = await db
      .from("flow_executions")
      .select("id, current_node_id, flow_id, contact_id, store_id, status")
      .eq("status", "waiting")
      .lte("next_step_at", new Date().toISOString())
      .limit(50)

    if (error) {
      console.error("Cron process-flows error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const executions = (data || []) as Array<{
      id: string
      current_node_id: string | null
      flow_id: string
      contact_id: string
      store_id: string
      status: string
    }>

    let processed = 0

    for (const execution of executions) {
      if (!execution.current_node_id) continue

      await processNode({
        id: execution.id,
        current_node_id: execution.current_node_id,
      })
      processed++
    }

    // ---- Process scheduled campaigns ----
    let campaignsSent = 0
    const { data: scheduledCampaigns, error: scError } = await db
      .from("campaigns")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .limit(20)

    if (scError) {
      console.error("Cron scheduled-campaigns error:", scError)
    }

    const campaignsToSend = (scheduledCampaigns || []) as Array<{ id: string }>

    for (const campaign of campaignsToSend) {
      try {
        // Mark as sending first to avoid double-processing
        await db
          .from("campaigns")
          .update({ status: "sending" })
          .eq("id", campaign.id)
          .eq("status", "scheduled")

        // Trigger the campaign send via internal fetch
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const res = await fetch(`${baseUrl}/api/campaigns/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: campaign.id }),
        })

        if (res.ok) {
          campaignsSent++
        } else {
          console.error(`Failed to send campaign ${campaign.id}:`, await res.text())
          // Revert status to scheduled so it can be retried
          await db
            .from("campaigns")
            .update({ status: "scheduled" })
            .eq("id", campaign.id)
        }
      } catch (sendErr) {
        console.error(`Error sending campaign ${campaign.id}:`, sendErr)
        await db
          .from("campaigns")
          .update({ status: "scheduled" })
          .eq("id", campaign.id)
      }
    }

    return NextResponse.json({
      ok: true,
      processed,
      campaigns_sent: campaignsSent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron process-flows error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
