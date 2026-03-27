import { createAdminClient } from "@/lib/supabase/admin"

interface ProductRecommendation {
  product_id: string
  title: string
  image_url: string | null
  price: number
  url: string | null
}

export async function getRecommendationsForContact(
  contactId: string,
  storeId: string,
  limit = 4
): Promise<ProductRecommendation[]> {
  const supabase = createAdminClient()

  try {
    // Get last 5 placed_order events for this contact
    const { data: orders } = await supabase
      .from("events")
      .select("properties")
      .eq("contact_id", contactId)
      .eq("store_id", storeId)
      .eq("event_type", "placed_order")
      .order("created_at", { ascending: false })
      .limit(5)

    const purchasedProductIds = new Set<string>()
    if (orders) {
      for (const order of orders) {
        const props = order.properties as Record<string, unknown>
        const items = (props?.line_items ?? props?.product_ids ?? []) as string[]
        items.forEach((id) => purchasedProductIds.add(String(id)))
      }
    }

    // Get products from the store excluding already purchased
    const query = supabase
      .from("products")
      .select("id, title, image_url, price, url")
      .eq("store_id", storeId)
      .limit(limit + purchasedProductIds.size)

    const { data: products } = await query

    if (!products) return []

    // Filter out purchased and limit
    const filtered = products
      .filter((p) => !purchasedProductIds.has(p.id))
      .slice(0, limit)

    return filtered.map((p) => ({
      product_id: p.id,
      title: p.title ?? "",
      image_url: p.image_url ?? null,
      price: p.price ?? 0,
      url: p.url ?? null,
    }))
  } catch {
    return []
  }
}

export async function getPopularProducts(
  storeId: string,
  limit = 4
): Promise<ProductRecommendation[]> {
  const supabase = createAdminClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    // Get placed_order events from last 30 days
    const { data: events } = await supabase
      .from("events")
      .select("properties")
      .eq("store_id", storeId)
      .eq("event_type", "placed_order")
      .gte("created_at", thirtyDaysAgo.toISOString())

    if (!events || events.length === 0) {
      // Fallback: just return newest products
      const { data: products } = await supabase
        .from("products")
        .select("id, title, image_url, price, url")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit)

      return (products ?? []).map((p) => ({
        product_id: p.id,
        title: p.title ?? "",
        image_url: p.image_url ?? null,
        price: p.price ?? 0,
        url: p.url ?? null,
      }))
    }

    // Count product frequency
    const productFrequency: Record<string, number> = {}
    for (const event of events) {
      const props = event.properties as Record<string, unknown>
      const items = (props?.line_items ?? props?.product_ids ?? []) as string[]
      for (const id of items) {
        const key = String(id)
        productFrequency[key] = (productFrequency[key] ?? 0) + 1
      }
    }

    // Sort by frequency and get top products
    const topIds = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)

    if (topIds.length === 0) return []

    const { data: products } = await supabase
      .from("products")
      .select("id, title, image_url, price, url")
      .in("id", topIds)

    if (!products) return []

    // Maintain frequency order
    const productMap = new Map(products.map((p) => [p.id, p]))
    return topIds
      .map((id) => productMap.get(id))
      .filter(Boolean)
      .map((p) => ({
        product_id: p!.id,
        title: p!.title ?? "",
        image_url: p!.image_url ?? null,
        price: p!.price ?? 0,
        url: p!.url ?? null,
      }))
  } catch {
    return []
  }
}

export async function getBrowseBasedRecommendations(
  contactId: string,
  storeId: string,
  limit = 4
): Promise<ProductRecommendation[]> {
  const supabase = createAdminClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  try {
    // Get viewed_product events from last 7 days
    const { data: views } = await supabase
      .from("events")
      .select("properties")
      .eq("contact_id", contactId)
      .eq("store_id", storeId)
      .eq("event_type", "viewed_product")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(20)

    if (!views || views.length === 0) {
      return getPopularProducts(storeId, limit)
    }

    // Extract categories from viewed products
    const categories = new Set<string>()
    const viewedProductIds = new Set<string>()
    for (const view of views) {
      const props = view.properties as Record<string, unknown>
      if (props?.category) categories.add(String(props.category))
      if (props?.product_id) viewedProductIds.add(String(props.product_id))
    }

    // Get purchased products to exclude
    const { data: orders } = await supabase
      .from("events")
      .select("properties")
      .eq("contact_id", contactId)
      .eq("store_id", storeId)
      .eq("event_type", "placed_order")

    const purchasedIds = new Set<string>()
    if (orders) {
      for (const order of orders) {
        const props = order.properties as Record<string, unknown>
        const items = (props?.line_items ?? props?.product_ids ?? []) as string[]
        items.forEach((id) => purchasedIds.add(String(id)))
      }
    }

    // Get products from same categories, not purchased
    const { data: products } = await supabase
      .from("products")
      .select("id, title, image_url, price, url")
      .eq("store_id", storeId)
      .limit(limit * 3)

    if (!products) return []

    const filtered = products
      .filter((p) => !purchasedIds.has(p.id))
      .slice(0, limit)

    return filtered.map((p) => ({
      product_id: p.id,
      title: p.title ?? "",
      image_url: p.image_url ?? null,
      price: p.price ?? 0,
      url: p.url ?? null,
    }))
  } catch {
    return []
  }
}

/**
 * Renders product recommendations as HTML for email templates.
 * Used as {{recommended_products}} merge tag.
 */
export function renderRecommendationsHtml(
  products: ProductRecommendation[]
): string {
  if (products.length === 0) return ""

  const productCards = products
    .map(
      (p) => `
    <td style="width:25%;padding:8px;vertical-align:top;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;text-align:center;">
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}" style="width:100%;height:auto;display:block;" />` : '<div style="height:120px;background:#f3f4f6;"></div>'}
        <div style="padding:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">${p.title}</p>
          <p style="margin:0;font-size:14px;color:#F97316;font-weight:700;">R$ ${p.price.toFixed(2).replace(".", ",")}</p>
          ${p.url ? `<a href="${p.url}" style="display:inline-block;margin-top:8px;padding:6px 16px;background:#F97316;color:#ffffff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:500;">Ver Produto</a>` : ""}
        </div>
      </div>
    </td>`
    )
    .join("")

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr>${productCards}</tr>
    </table>
  `
}
