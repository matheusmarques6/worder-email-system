import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = request.nextUrl.searchParams.get("url")
  if (!url) return NextResponse.redirect(new URL("/", request.url))
  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) return NextResponse.redirect(new URL("/", request.url))
  } catch { return NextResponse.redirect(new URL("/", request.url)) }
  try {
    const supabase = createAdminClient()
    const { data: emailSend } = await supabase.from("email_sends").select("id, clicked_at, contact_id, store_id").eq("id", id).single()
    if (emailSend) {
      if (!emailSend.clicked_at) await supabase.from("email_sends").update({ clicked_at: new Date().toISOString() }).eq("id", id)
      await supabase.from("events").insert({ store_id: emailSend.store_id, contact_id: emailSend.contact_id, type: "email_clicked", data: { email_send_id: id, url } })
    }
  } catch { /* silent */ }
  return NextResponse.redirect(url, 302)
}
