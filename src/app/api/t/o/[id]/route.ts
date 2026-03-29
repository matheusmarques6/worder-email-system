import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  try {
    const { data: emailSend } = await supabase
      .from("email_sends")
      .select("id, opened_at, contact_id, store_id, campaign_id")
      .eq("id", id)
      .single()

    if (emailSend && !emailSend.opened_at) {
      // Update email_sends
      await supabase
        .from("email_sends")
        .update({
          opened_at: new Date().toISOString(),
          status: "opened",
        })
        .eq("id", id)

      // Update campaign total_opened if campaign_id exists
      if (emailSend.campaign_id) {
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("total_opened")
          .eq("id", emailSend.campaign_id)
          .single()

        if (campaign) {
          await supabase
            .from("campaigns")
            .update({
              total_opened: ((campaign as Record<string, unknown>).total_opened as number || 0) + 1,
            })
            .eq("id", emailSend.campaign_id)
        }
      }

      // Insert event
      await supabase.from("events").insert({
        store_id: emailSend.store_id,
        contact_id: emailSend.contact_id,
        type: "email_opened",
        data: {
          email_send_id: id,
          campaign_id: emailSend.campaign_id || undefined,
        },
      })
    }
  } catch {
    // Silently fail - don't break the pixel
  }

  return new Response(TRANSPARENT_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store",
    },
  })
}
