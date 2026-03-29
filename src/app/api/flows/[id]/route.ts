import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const storeId = request.nextUrl.searchParams.get("store_id")

  if (!storeId) {
    return Response.json({ error: "store_id is required" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: flow, error } = await db
    .from("flows")
    .select("*")
    .eq("id", id)
    .eq("store_id", storeId)
    .single()

  if (error || !flow) {
    return Response.json({ error: "Flow not found" }, { status: 404 })
  }

  return Response.json({ flow })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = (await request.json()) as {
      storeId: string
      name?: string
      status?: string
      flow_definition?: Record<string, unknown>
      trigger_config?: Record<string, unknown>
    }
    const { storeId, name, status, flow_definition, trigger_config } = body

    if (!storeId) {
      return Response.json({ error: "storeId is required" }, { status: 400 })
    }

    const db = createAdminClient()

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name !== undefined) updates.name = name
    if (status !== undefined) updates.status = status
    if (flow_definition !== undefined) updates.flow_definition = flow_definition
    if (trigger_config !== undefined) updates.trigger_config = trigger_config

    const { data: flow, error } = await db
      .from("flows")
      .update(updates)
      .eq("id", id)
      .eq("store_id", storeId)
      .select()
      .single()

    if (error || !flow) {
      return Response.json(
        { error: "Flow not found or update failed" },
        { status: 404 }
      )
    }

    return Response.json({ flow })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const storeId = request.nextUrl.searchParams.get("store_id")

  if (!storeId) {
    return Response.json({ error: "store_id is required" }, { status: 400 })
  }

  const db = createAdminClient()
  const { error } = await db
    .from("flows")
    .delete()
    .eq("id", id)
    .eq("store_id", storeId)

  if (error) {
    return Response.json({ error: "Failed to delete flow" }, { status: 500 })
  }

  return Response.json({ success: true })
}
