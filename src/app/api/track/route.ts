import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      store_id: string
      contact_id?: string
      email?: string
      event_type: string
      data?: Record<string, unknown>
    }

    if (!body.store_id || !body.event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = supabaseAdmin()

    let contactId = body.contact_id
    if (!contactId && body.email) {
      const { data: contact } = await db
        .from("contacts")
        .select("id")
        .eq("store_id", body.store_id)
        .eq("email", body.email)
        .single()
      contactId = contact?.id as string | undefined
    }

    if (!contactId) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    await db.from("events").insert({
      store_id: body.store_id,
      contact_id: contactId,
      event_type: body.event_type,
      data: body.data ?? {},
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
