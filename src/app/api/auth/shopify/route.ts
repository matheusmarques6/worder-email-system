import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildAuthUrl } from "@/lib/shopify/oauth"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop")

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const state = uuidv4()
  const authUrl = buildAuthUrl(shop, state)

  return NextResponse.redirect(authUrl)
}
