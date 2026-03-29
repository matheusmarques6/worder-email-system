import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

interface ResendWebhookPayload {
  type: string
  data: {
    email_id: string
    to?: string[]
    created_at?: string
  }
}

export async function POST(request: NextRequest) {
  let payload: ResendWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { type, data } = payload

  if (!data?.email_id) {
    return NextResponse.json({ received: true })
  }

  const resendMessageId = data.email_id

  // Find the email_send by resend_message_id
  const { data: emailSend } = await supabase
    .from("email_sends")
    .select("id, contact_id, store_id, campaign_id")
    .eq("resend_message_id", resendMessageId)
    .single()

  if (!emailSend) {
    return NextResponse.json({ received: true })
  }

  switch (type) {
    case "email.delivered": {
      await supabase
        .from("email_sends")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", emailSend.id)

      // Update campaign total_delivered
      if (emailSend.campaign_id) {
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("total_delivered")
          .eq("id", emailSend.campaign_id)
          .single()

        if (campaign) {
          await supabase
            .from("campaigns")
            .update({
              total_delivered: ((campaign as Record<string, unknown>).total_delivered as number || 0) + 1,
            })
            .eq("id", emailSend.campaign_id)
        }
      }
      break
    }

    case "email.bounced": {
      await supabase
        .from("email_sends")
        .update({
          status: "bounced",
          bounced_at: new Date().toISOString(),
        })
        .eq("id", emailSend.id)

      // Update campaign total_bounced
      if (emailSend.campaign_id) {
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("total_bounced")
          .eq("id", emailSend.campaign_id)
          .single()

        if (campaign) {
          await supabase
            .from("campaigns")
            .update({
              total_bounced: ((campaign as Record<string, unknown>).total_bounced as number || 0) + 1,
            })
            .eq("id", emailSend.campaign_id)
        }
      }

      // Set contact subscribed = false
      await supabase
        .from("contacts")
        .update({ subscribed: false })
        .eq("id", emailSend.contact_id)
      break
    }

    case "email.complained": {
      await supabase
        .from("email_sends")
        .update({ status: "complained" })
        .eq("id", emailSend.id)

      // Set contact subscribed = false
      await supabase
        .from("contacts")
        .update({ subscribed: false })
        .eq("id", emailSend.contact_id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
