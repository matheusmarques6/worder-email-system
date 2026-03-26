import { createAdminClient } from "@/lib/supabase/admin"

interface ShopifyProduct {
  id: number
  title: string
  variants: Array<{
    id: number
    inventory_quantity: number
    price: string
  }>
  images: Array<{ src: string }>
}

export async function handleBackInStock(
  storeId: string,
  product: ShopifyProduct
): Promise<{ notified: number }> {
  const supabase = createAdminClient()
  let notified = 0

  try {
    // Check if any variant has inventory > 0
    const hasStock = product.variants.some((v) => v.inventory_quantity > 0)
    if (!hasStock) return { notified: 0 }

    const shopifyProductId = String(product.id)

    // Find contacts who requested back-in-stock for this product
    const { data: requests } = await supabase
      .from("events")
      .select("contact_id")
      .eq("store_id", storeId)
      .eq("type", "back_in_stock_request")
      .filter("properties->>product_id", "eq", shopifyProductId)

    if (!requests || requests.length === 0) return { notified: 0 }

    // Deduplicate contact IDs
    const uniqueContactIds = [...new Set(requests.map((r) => r.contact_id))]

    // Create notification events for each contact
    for (const contactId of uniqueContactIds) {
      await supabase.from("events").insert({
        contact_id: contactId,
        store_id: storeId,
        type: "back_in_stock_available",
        properties: {
          product_id: shopifyProductId,
          product_title: product.title,
          product_image: product.images?.[0]?.src ?? null,
          product_price: product.variants[0]?.price ?? "0",
        },
        created_at: new Date().toISOString(),
      })
      notified++
    }

    // Clean up the fulfilled requests
    await supabase
      .from("events")
      .delete()
      .eq("store_id", storeId)
      .eq("type", "back_in_stock_request")
      .filter("properties->>product_id", "eq", shopifyProductId)

    return { notified }
  } catch {
    return { notified: 0 }
  }
}
