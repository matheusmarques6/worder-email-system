import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getCampaignMetrics } from "@/lib/analytics/metrics"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const stats = await getCampaignMetrics(id)

    return NextResponse.json({ campaign, stats })
  } catch (err) {
    console.error("Get campaign error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = createAdminClient()

    // Remove fields that shouldn't be updated directly
    const {
      id: _id,
      store_id: _storeId,
      created_at: _createdAt,
      ...updateFields
    } = body

    const { data, error } = await supabase
      .from("campaigns")
      .update({ ...updateFields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign: data })
  } catch (err) {
    console.error("Update campaign error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Check campaign status - only allow deleting drafts
    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("status")
      .eq("id", id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft campaigns can be deleted" },
        { status: 400 }
      )
    }

    const { error } = await supabase.from("campaigns").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete campaign error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
