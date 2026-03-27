import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? ""

export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string
): boolean {
  const digest = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(rawBody, "utf8")
    .digest("base64")
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(hmacHeader)
  )
}

export async function handleOrderCreated(
  storeId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const db = supabaseAdmin()
  const customer = payload.customer as Record<string, unknown> | undefined
  const email = (payload.email as string) ?? (customer?.email as string) ?? ""
  if (!email) return

  const { data: contact } = await db
    .from("contacts")
    .upsert(
      {
        store_id: storeId,
        email,
        first_name: (customer?.first_name as string) ?? null,
        last_name: (customer?.last_name as string) ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id,email" }
    )
    .select("id")
    .single()

  if (contact) {
    await db.from("events").insert({
      store_id: storeId,
      contact_id: contact.id,
      event_type: "placed_order",
      data: { order_id: String(payload.id ?? ""), total: payload.total_price },
      created_at: new Date().toISOString(),
    })
  }
}

export async function handleCustomerCreated(
  storeId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const db = supabaseAdmin()
  const email = (payload.email as string) ?? ""
  if (!email) return

  await db
    .from("contacts")
    .upsert(
      {
        store_id: storeId,
        email,
        first_name: (payload.first_name as string) ?? null,
        last_name: (payload.last_name as string) ?? null,
        phone: (payload.phone as string) ?? null,
        subscribed: (payload.accepts_marketing as boolean) ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id,email" }
    )
    .select("id")
    .single()
}

export async function handleCheckoutCreated(
  storeId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const db = supabaseAdmin()
  const email = (payload.email as string) ?? ""
  if (!email) return

  const { data: contact } = await db
    .from("contacts")
    .select("id")
    .eq("store_id", storeId)
    .eq("email", email)
    .single()

  if (contact) {
    await db.from("events").insert({
      store_id: storeId,
      contact_id: contact.id,
      event_type: "started_checkout",
      data: { checkout_token: payload.token, total: payload.total_price },
      created_at: new Date().toISOString(),
    })
  }
}
