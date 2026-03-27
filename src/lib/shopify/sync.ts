import { supabaseAdmin } from "@/lib/supabase/admin"

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  images: Array<{ src: string }>
  variants: Array<{ price: string; compare_at_price: string | null }>
}

export async function syncProducts(
  storeId: string,
  shop: string,
  accessToken: string
): Promise<number> {
  const db = supabaseAdmin()
  let synced = 0
  let pageInfo: string | null = null

  do {
    const url: string = pageInfo
      ? `https://${shop}/admin/api/2024-01/products.json?limit=50&page_info=${pageInfo}`
      : `https://${shop}/admin/api/2024-01/products.json?limit=50`

    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    })

    if (!res.ok) break

    const data = (await res.json()) as { products: ShopifyProduct[] }

    for (const product of data.products) {
      await db.from("products").upsert(
        {
          store_id: storeId,
          external_id: String(product.id),
          name: product.title,
          handle: product.handle,
          image_url: product.images?.[0]?.src ?? null,
          price: product.variants?.[0]?.price ?? "0",
          compare_at_price: product.variants?.[0]?.compare_at_price ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,external_id" }
      )
      synced++
    }

    const linkHeader = res.headers.get("link")
    const nextMatch = linkHeader?.match(/page_info=([^>&]+)>;\s*rel="next"/)
    pageInfo = nextMatch?.[1] ?? null
  } while (pageInfo)

  return synced
}

export async function syncCustomers(
  storeId: string,
  shop: string,
  accessToken: string
): Promise<number> {
  const db = supabaseAdmin()
  let synced = 0

  const res = await fetch(
    `https://${shop}/admin/api/2024-01/customers.json?limit=250`,
    { headers: { "X-Shopify-Access-Token": accessToken } }
  )

  if (!res.ok) return 0

  const data = (await res.json()) as {
    customers: Array<{
      id: number
      email: string
      first_name: string
      last_name: string
      phone: string | null
      accepts_marketing: boolean
      orders_count: number
      total_spent: string
    }>
  }

  for (const customer of data.customers) {
    if (!customer.email) continue
    await db.from("contacts").upsert(
      {
        store_id: storeId,
        email: customer.email,
        first_name: customer.first_name ?? null,
        last_name: customer.last_name ?? null,
        phone: customer.phone ?? null,
        subscribed: customer.accepts_marketing ?? false,
        total_orders: customer.orders_count ?? 0,
        total_spent: parseFloat(customer.total_spent) || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id,email" }
    )
    synced++
  }

  return synced
}
