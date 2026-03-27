import { createAdminClient } from "@/lib/supabase/admin"

interface BackInStockAlert {
  contact_id: string
  product: {
    id: string
    title: string
    image_url: string | null
    price: number
    url: string | null
  }
}

export async function checkBackInStock(storeId: string): Promise<BackInStockAlert[]> {
  const supabase = createAdminClient()

  try {
    // Get back_in_stock_request events
    const { data: requests } = await supabase
      .from("events")
      .select("contact_id, properties")
      .eq("store_id", storeId)
      .eq("event_type", "back_in_stock_request")

    if (!requests || requests.length === 0) return []

    // Extract unique product IDs from requests
    const productContactMap: Record<string, string[]> = {}
    for (const req of requests) {
      const props = req.properties as Record<string, unknown>
      const productId = String(props?.product_id ?? "")
      if (!productId) continue
      if (!productContactMap[productId]) productContactMap[productId] = []
      productContactMap[productId].push(req.contact_id)
    }

    const productIds = Object.keys(productContactMap)
    if (productIds.length === 0) return []

    // Check which products are now in stock (status = active, inventory > 0)
    const { data: products } = await supabase
      .from("products")
      .select("id, title, image_url, price, url")
      .eq("store_id", storeId)
      .in("id", productIds)
      .gt("inventory_quantity", 0)

    if (!products || products.length === 0) return []

    // Build alerts
    const alerts: BackInStockAlert[] = []
    for (const product of products) {
      const contactIds = productContactMap[product.id] ?? []
      for (const contactId of contactIds) {
        alerts.push({
          contact_id: contactId,
          product: {
            id: product.id,
            title: product.title ?? "",
            image_url: product.image_url ?? null,
            price: product.price ?? 0,
            url: product.url ?? null,
          },
        })
      }
    }

    return alerts
  } catch {
    return []
  }
}

export async function requestBackInStock(
  contactId: string,
  productId: string,
  storeId: string
): Promise<boolean> {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase.from("events").insert({
      contact_id: contactId,
      store_id: storeId,
      event_type: "back_in_stock_request",
      properties: { product_id: productId },
      created_at: new Date().toISOString(),
    })

    return !error
  } catch {
    return false
  }
}
