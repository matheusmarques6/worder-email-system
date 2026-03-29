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
  const { data: template, error } = await db
    .from("templates")
    .select("*")
    .eq("id", id)
    .eq("store_id", storeId)
    .single()

  if (error || !template) {
    return Response.json({ error: "Template not found" }, { status: 404 })
  }

  return Response.json({ template })
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
      subject?: string
      html?: string
      design_json?: Record<string, unknown>
    }
    const { storeId, name, subject, html, design_json } = body

    if (!storeId) {
      return Response.json({ error: "storeId is required" }, { status: 400 })
    }

    const db = createAdminClient()

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name !== undefined) updates.name = name
    if (subject !== undefined) updates.subject = subject
    if (html !== undefined) updates.html = html
    if (design_json !== undefined) updates.design_json = design_json

    const { data: template, error } = await db
      .from("templates")
      .update(updates)
      .eq("id", id)
      .eq("store_id", storeId)
      .select()
      .single()

    if (error || !template) {
      return Response.json(
        { error: "Template not found or update failed" },
        { status: 404 }
      )
    }

    return Response.json({ template })
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
    .from("templates")
    .delete()
    .eq("id", id)
    .eq("store_id", storeId)

  if (error) {
    return Response.json(
      { error: "Failed to delete template" },
      { status: 500 }
    )
  }

  return Response.json({ success: true })
}
