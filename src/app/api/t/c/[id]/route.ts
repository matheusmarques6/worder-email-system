import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const db = supabaseAdmin()

    // Record click
    await db
      .from("email_sends")
      .update({ clicked_at: new Date().toISOString() })
      .eq("id", id)
      .is("clicked_at", null)
  } catch (error) {
    console.error("Click tracking error:", error)
  }

  return NextResponse.redirect(url)
}
