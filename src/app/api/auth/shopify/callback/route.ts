import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exchangeCodeForToken, saveShopifyCredentials } from "@/lib/shopify/oauth"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const shop = searchParams.get("shop")
  const code = searchParams.get("code")

  if (!shop || !code) {
    return NextResponse.redirect(new URL("/settings/integrations?error=missing_params", request.url))
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get user's store
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!store) {
      return NextResponse.redirect(new URL("/settings/integrations?error=no_store", request.url))
    }

    const accessToken = await exchangeCodeForToken(shop, code)
    await saveShopifyCredentials(store.id, shop, accessToken)

    return NextResponse.redirect(new URL("/settings/integrations?success=true", request.url))
  } catch (error) {
    console.error("Shopify callback error:", error)
    return NextResponse.redirect(new URL("/settings/integrations?error=callback_failed", request.url))
  }
}
