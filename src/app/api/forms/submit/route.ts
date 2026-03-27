import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      store_id: string
      list_id: string
      email: string
      first_name?: string
      last_name?: string
      phone?: string
    }

    if (!body.store_id || !body.email) {
      return NextResponse.json({ error: "store_id and email are required" }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Upsert contact
    const { data: contact, error: contactError } = await db
      .from("contacts")
      .upsert(
        {
          store_id: body.store_id,
          email: body.email,
          first_name: body.first_name ?? null,
          last_name: body.last_name ?? null,
          phone: body.phone ?? null,
          subscribed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,email" }
      )
      .select("id")
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
    }

    // Add to list if list_id provided
    if (body.list_id) {
      await db
        .from("list_members")
        .upsert(
          {
            list_id: body.list_id,
            contact_id: contact.id,
            created_at: new Date().toISOString(),
          },
          { onConflict: "list_id,contact_id" }
        )

      // Update list member count
      const { count } = await db
        .from("list_members")
        .select("*", { count: "exact", head: true })
        .eq("list_id", body.list_id)

      await db
        .from("lists")
        .update({ member_count: count ?? 0 })
        .eq("id", body.list_id)
    }

    return NextResponse.json({ success: true, contact_id: contact.id })
  } catch (error) {
    console.error("Form submit error:", error)
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 })
  }
}
