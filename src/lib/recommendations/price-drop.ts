import { createAdminClient } from "@/lib/supabase/admin"

interface PriceDropAlert {
  product_id: string
  title: string
  image_url: string | null
  old_price: number
  new_price: number
  drop_percentage: number
  url: string | null
}

export async function checkPriceDrops(storeId: string): Promise<PriceDropAlert[]> {
  const supabase = createAdminClient()

  try {
    // Get the latest price snapshots
    const { data: snapshots } = await supabase
      .from("events")
      .select("properties")
      .eq("store_id", storeId)
      .eq("event_type", "product_price_snapshot")
      .order("created_at", { ascending: false })

    if (!snapshots || snapshots.length === 0) return []

    // Build map of last known prices (most recent snapshot per product)
    const lastPrices: Record<string, number> = {}
    for (const snap of snapshots) {
      const props = snap.properties as Record<string, unknown>
      const productId = String(props?.product_id ?? "")
      if (productId && !(productId in lastPrices)) {
        lastPrices[productId] = Number(props?.price ?? 0)
      }
    }

    const productIds = Object.keys(lastPrices)
    if (productIds.length === 0) return []

    // Get current product prices
    const { data: products } = await supabase
      .from("products")
      .select("id, title, image_url, price, url")
      .eq("store_id", storeId)
      .in("id", productIds)

    if (!products) return []

    // Check for drops > 10%
    const alerts: PriceDropAlert[] = []
    for (const product of products) {
      const oldPrice = lastPrices[product.id]
      const newPrice = product.price ?? 0
      if (oldPrice > 0 && newPrice < oldPrice) {
        const dropPct = ((oldPrice - newPrice) / oldPrice) * 100
        if (dropPct >= 10) {
          alerts.push({
            product_id: product.id,
            title: product.title ?? "",
            image_url: product.image_url ?? null,
            old_price: oldPrice,
            new_price: newPrice,
            drop_percentage: Math.round(dropPct * 10) / 10,
            url: product.url ?? null,
          })
        }
      }
    }

    return alerts.sort((a, b) => b.drop_percentage - a.drop_percentage)
  } catch {
    return []
  }
}

export async function snapshotPrices(storeId: string): Promise<number> {
  const supabase = createAdminClient()
  let count = 0

  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, price, compare_at_price")
      .eq("store_id", storeId)

    if (!products || products.length === 0) return 0

    const now = new Date().toISOString()
    const events = products.map((p) => ({
      store_id: storeId,
      event_type: "product_price_snapshot",
      properties: {
        product_id: p.id,
        price: p.price,
        compare_at_price: p.compare_at_price,
        date: now,
      },
      created_at: now,
    }))

    // Insert in batches of 100
    for (let i = 0; i < events.length; i += 100) {
      const batch = events.slice(i, i + 100)
      const { error } = await supabase.from("events").insert(batch)
      if (!error) count += batch.length
    }

    return count
  } catch {
    return 0
  }
}
