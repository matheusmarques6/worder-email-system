import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface ResendWebhookPayload {
  type: string
  data: {
    email_id: string
    to: string[]
    created_at: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ResendWebhookPayload
    const db = supabaseAdmin()

    const { type, data } = payload
    const providerId = data.email_id

    if (!providerId) {
      return NextResponse.json({ error: "Missing email_id" }, { status: 400 })
    }

    switch (type) {
      case "email.delivered":
        await db
          .from("email_sends")
          .update({ status: "delivered", delivered_at: new Date().toISOString() })
          .eq("provider_id", providerId)
        break

      case "email.opened":
        await db
          .from("email_sends")
          .update({ opened_at: new Date().toISOString() })
          .eq("provider_id", providerId)
          .is("opened_at", null)
        break

      case "email.clicked":
        await db
          .from("email_sends")
          .update({ clicked_at: new Date().toISOString() })
          .eq("provider_id", providerId)
          .is("clicked_at", null)
        break

      case "email.bounced":
        await db
          .from("email_sends")
          .update({ status: "bounced", bounced_at: new Date().toISOString() })
          .eq("provider_id", providerId)
        break

      case "email.complained":
        await db
          .from("email_sends")
          .update({ status: "complained" })
          .eq("provider_id", providerId)

        // Auto-unsubscribe on complaint
        const { data: emailSend } = await db
          .from("email_sends")
          .select("contact_id")
          .eq("provider_id", providerId)
          .single()

        if (emailSend?.contact_id) {
          await db
            .from("contacts")
            .update({ subscribed: false })
            .eq("id", emailSend.contact_id)
        }
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resend webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
