import { supabaseAdmin } from "@/lib/supabase/admin"

interface OrderData {
  total: number
  items: { category?: string }[]
  created_at: string
}

interface ProductViewData {
  product_id: string
  product_name: string
  category?: string
}

interface ContactInsights {
  lifetime_value: number
  purchase_frequency: string
  churn_risk: "low" | "medium" | "high"
  preferred_channel: "email" | "whatsapp"
  engagement_score: number
}

export async function enrichContactFromOrder(
  contactId: string,
  storeId: string,
  orderData: OrderData
) {
  const { data: contact } = await supabaseAdmin
    .from("contacts")
    .select("properties")
    .eq("id", contactId)
    .eq("store_id", storeId)
    .single()

  const props = (contact?.properties as Record<string, unknown>) || {}

  const categories = orderData.items
    .map((item) => item.category)
    .filter(Boolean) as string[]

  const existingCategories = (props.preferred_categories as string[]) || []
  const allCategories = [...new Set([...existingCategories, ...categories])]

  const now = orderData.created_at
  const firstPurchase = (props.first_purchase_date as string) || now
  const lastPurchase = now

  const { count: orderCount } = await supabaseAdmin
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("contact_id", contactId)
    .eq("store_id", storeId)
    .eq("event_type", "placed_order")

  const totalOrders = orderCount || 1
  const daysSinceFirst =
    (new Date(lastPurchase).getTime() - new Date(firstPurchase).getTime()) /
    (1000 * 60 * 60 * 24)
  const avgDaysBetween =
    totalOrders > 1 ? Math.round(daysSinceFirst / (totalOrders - 1)) : 0
  const predictedNext =
    avgDaysBetween > 0
      ? new Date(
          new Date(lastPurchase).getTime() + avgDaysBetween * 86400000
        ).toISOString()
      : null

  const updatedProps = {
    ...props,
    first_purchase_date: firstPurchase,
    last_purchase_date: lastPurchase,
    purchase_frequency: totalOrders > 1 ? `${avgDaysBetween}d` : "first",
    preferred_categories: allCategories,
    avg_days_between_orders: avgDaysBetween,
    predicted_next_order_date: predictedNext,
  }

  await supabaseAdmin
    .from("contacts")
    .update({ properties: updatedProps })
    .eq("id", contactId)
    .eq("store_id", storeId)
}

export async function enrichContactFromProductView(
  contactId: string,
  storeId: string,
  productData: ProductViewData
) {
  const { data: contact } = await supabaseAdmin
    .from("contacts")
    .select("properties")
    .eq("id", contactId)
    .eq("store_id", storeId)
    .single()

  const props = (contact?.properties as Record<string, unknown>) || {}

  const recentlyViewed = (
    (props.recently_viewed_products as string[]) || []
  ).slice(0, 19)
  recentlyViewed.unshift(productData.product_id)

  const categoryViews = (
    (props.category_views as Record<string, number>) || {}
  )
  if (productData.category) {
    categoryViews[productData.category] =
      (categoryViews[productData.category] || 0) + 1
  }

  const mostViewedCategory = Object.entries(categoryViews).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] || null

  const updatedProps = {
    ...props,
    recently_viewed_products: recentlyViewed,
    category_views: categoryViews,
    most_viewed_category: mostViewedCategory,
  }

  await supabaseAdmin
    .from("contacts")
    .update({ properties: updatedProps })
    .eq("id", contactId)
    .eq("store_id", storeId)
}

export async function getContactInsights(
  contactId: string,
  storeId: string
): Promise<ContactInsights> {
  const { data: contact } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("store_id", storeId)
    .single()

  const props = (contact?.properties as Record<string, unknown>) || {}
  const totalSpent = (props.total_spent as number) || 0
  const totalOrders = (props.total_orders as number) || 0
  const avgDaysBetween = (props.avg_days_between_orders as number) || 0
  const lastOrderAt = props.last_purchase_date as string | undefined

  const daysSinceLastOrder = lastOrderAt
    ? Math.round(
        (Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 999

  let churnRisk: "low" | "medium" | "high" = "low"
  if (daysSinceLastOrder > 90 || (avgDaysBetween > 0 && daysSinceLastOrder > avgDaysBetween * 2)) {
    churnRisk = "high"
  } else if (daysSinceLastOrder > 60 || (avgDaysBetween > 0 && daysSinceLastOrder > avgDaysBetween * 1.5)) {
    churnRisk = "medium"
  }

  let frequency = "Novo"
  if (totalOrders >= 5) frequency = "Frequente"
  else if (totalOrders >= 2) frequency = "Recorrente"
  else if (totalOrders === 1) frequency = "Primeiro pedido"

  const { count: emailOpens } = await supabaseAdmin
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("contact_id", contactId)
    .eq("store_id", storeId)
    .eq("event_type", "email_opened")
    .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())

  const engagementScore = Math.min(100, (emailOpens || 0) * 10 + totalOrders * 15 + (totalSpent > 100 ? 20 : 0))

  return {
    lifetime_value: totalSpent,
    purchase_frequency: frequency,
    churn_risk: churnRisk,
    preferred_channel: "email",
    engagement_score: engagementScore,
  }
}
