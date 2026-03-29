import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.redirect(new URL("/", request.url), 302)
  }

  const supabase = createAdminClient()

  try {
    const { data: emailSend } = await supabase
      .from("email_sends")
      .select("id, clicked_at, contact_id, store_id, campaign_id")
      .eq("id", id)
      .single()

    if (emailSend) {
      // Update clicked_at only if not already clicked
      if (!emailSend.clicked_at) {
        await supabase
          .from("email_sends")
          .update({
            clicked_at: new Date().toISOString(),
            status: "clicked",
          })
          .eq("id", id)
      }

      // Update campaign total_clicked if campaign_id exists
      if (emailSend.campaign_id) {
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("total_clicked")
          .eq("id", emailSend.campaign_id)
          .single()

        if (campaign) {
          await supabase
            .from("campaigns")
            .update({
              total_clicked: ((campaign as Record<string, unknown>).total_clicked as number || 0) + 1,
            })
            .eq("id", emailSend.campaign_id)
        }
      }

      // Insert event
      await supabase.from("events").insert({
        store_id: emailSend.store_id,
        contact_id: emailSend.contact_id,
        type: "email_clicked",
        data: {
          url,
          email_send_id: id,
          campaign_id: emailSend.campaign_id || undefined,
        },
      })
    }
  } catch {
    // Silently fail - still redirect
  }

  return NextResponse.redirect(url, 302)
}
