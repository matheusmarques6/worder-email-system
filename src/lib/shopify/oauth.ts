import { supabaseAdmin } from "@/lib/supabase/admin"

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY ?? ""
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? ""
const SHOPIFY_SCOPES = "read_customers,read_orders,read_products,read_checkouts,write_script_tags"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""

export function buildAuthUrl(shop: string, state: string): string {
  const redirectUri = `${APP_URL}/api/auth/shopify/callback`
  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
}

export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<string> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed: ${response.statusText}`)
  }

  const data = (await response.json()) as { access_token: string }
  return data.access_token
}

export async function saveShopifyCredentials(
  storeId: string,
  shop: string,
  accessToken: string
): Promise<void> {
  const db = supabaseAdmin()
  await db
    .from("stores")
    .update({
      shopify_domain: shop,
      shopify_access_token: accessToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", storeId)
}
