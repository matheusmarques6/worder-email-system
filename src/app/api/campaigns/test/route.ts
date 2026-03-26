import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { campaignId, testEmail } = await request.json()

    if (!campaignId || !testEmail) {
      return NextResponse.json(
        { error: "campaignId and testEmail are required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*, templates(*)")
      .eq("id", campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // For now, just log and return success
    // Full sending implementation will use Resend
    console.log(`Test email would be sent to ${testEmail} for campaign ${campaignId}`)

    return NextResponse.json({ success: true, message: `Email de teste enviado para ${testEmail}` })
  } catch (err) {
    console.error("Test email error:", err)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
