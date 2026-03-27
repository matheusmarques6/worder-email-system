import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  let payload: { type: string; data: { email_id: string } }
  try { payload = await request.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const supabase = createAdminClient()
  if (!payload.data?.email_id) return NextResponse.json({ received: true })
  const { data: emailSend } = await supabase.from("email_sends").select("id, contact_id").eq("resend_message_id", payload.data.email_id).single()
  if (!emailSend) return NextResponse.json({ received: true })
  switch (payload.type) {
    case "email.delivered":
      await supabase.from("email_sends").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", emailSend.id)
      break
    case "email.bounced":
      await supabase.from("email_sends").update({ status: "bounced", bounced_at: new Date().toISOString() }).eq("id", emailSend.id)
      await supabase.from("contacts").update({ subscribed: false }).eq("id", emailSend.contact_id)
      break
    case "email.complained":
      await supabase.from("contacts").update({ subscribed: false }).eq("id", emailSend.contact_id)
      break
  }
  return NextResponse.json({ received: true })
}
