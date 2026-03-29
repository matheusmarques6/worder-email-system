import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("store_id")
    if (!storeId) {
      return NextResponse.json({ error: "store_id is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaigns: data })
  } catch (err) {
    console.error("List campaigns error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      store_id,
      name,
      subject,
      template_id,
      list_id,
      segment_id,
      sender_name,
      sender_email,
      ab_test_enabled,
      subject_b,
      ab_split,
      scheduled_at,
    } = body

    if (!store_id || !name) {
      return NextResponse.json(
        { error: "store_id and name are required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        store_id,
        name,
        subject: subject ?? null,
        template_id: template_id ?? null,
        list_id: list_id ?? null,
        segment_id: segment_id ?? null,
        sender_name: sender_name ?? null,
        sender_email: sender_email ?? null,
        ab_test_enabled: ab_test_enabled ?? false,
        subject_b: subject_b ?? null,
        ab_split: ab_split ?? 50,
        scheduled_at: scheduled_at ?? null,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (err) {
    console.error("Create campaign error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
