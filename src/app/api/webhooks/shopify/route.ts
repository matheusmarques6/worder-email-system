import { NextRequest, NextResponse } from "next/server"
import { verifyShopifyWebhook, handleOrderCreated, handleCustomerCreated, handleCheckoutCreated } from "@/lib/shopify/webhooks"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { processEvent } from "@/lib/flows/engine"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const hmac = request.headers.get("x-shopify-hmac-sha256") ?? ""
  const topic = request.headers.get("x-shopify-topic") ?? ""
  const shopDomain = request.headers.get("x-shopify-shop-domain") ?? ""

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const db = supabaseAdmin()
  const { data: store } = await db
    .from("stores")
    .select("id")
    .eq("shopify_domain", shopDomain)
    .single()

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 })
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>

  try {
    switch (topic) {
      case "orders/create":
      case "orders/paid":
        await handleOrderCreated(store.id, payload)
        // Trigger flows
        const orderEmail = (payload.email as string) ?? ""
        if (orderEmail) {
          const { data: contact } = await db
            .from("contacts")
            .select("id")
            .eq("store_id", store.id)
            .eq("email", orderEmail)
            .single()
          if (contact) {
            await processEvent(store.id, "placed_order", contact.id, payload)
          }
        }
        break

      case "customers/create":
        await handleCustomerCreated(store.id, payload)
        const custEmail = (payload.email as string) ?? ""
        if (custEmail) {
          const { data: contact } = await db
            .from("contacts")
            .select("id")
            .eq("store_id", store.id)
            .eq("email", custEmail)
            .single()
          if (contact) {
            await processEvent(store.id, "customer_created", contact.id, payload)
          }
        }
        break

      case "checkouts/create":
        await handleCheckoutCreated(store.id, payload)
        const checkoutEmail = (payload.email as string) ?? ""
        if (checkoutEmail) {
          const { data: contact } = await db
            .from("contacts")
            .select("id")
            .eq("store_id", store.id)
            .eq("email", checkoutEmail)
            .single()
          if (contact) {
            await processEvent(store.id, "started_checkout", contact.id, payload)
          }
        }
        break

      default:
        console.log(`Unhandled Shopify webhook topic: ${topic}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Shopify webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
