import { processConditionalBlocks } from "./conditional-content"

interface MergeData {
  contact: {
    first_name?: string | null
    last_name?: string | null
    email?: string
    phone?: string | null
    created_at?: string
    total_orders?: number
    total_spent?: number
    gender?: string | null
  }
  store: {
    name?: string
    url?: string
  }
  order?: {
    order_number?: string
    order_total?: string
    tracking_url?: string
  }
  cart?: {
    items?: string
    total?: string
    url?: string
  }
  product?: {
    name?: string
    image?: string
    price?: string
    url?: string
  }
  recommended_products_html?: string
  discount_code?: string
}

/**
 * Prepare email HTML by replacing merge tags and processing conditional blocks
 */
export function prepareEmailHtml(
  html: string,
  mergeData: MergeData,
  emailSendId?: string
): string {
  let result = html

  // 1. Process conditional blocks first
  result = processConditionalBlocks(
    result,
    mergeData.contact,
    mergeData.store as Record<string, unknown>
  )

  // 2. Replace profile merge tags
  result = result.replace(/\{\{first_name\}\}/g, mergeData.contact.first_name ?? "")
  result = result.replace(/\{\{last_name\}\}/g, mergeData.contact.last_name ?? "")
  result = result.replace(/\{\{email\}\}/g, mergeData.contact.email ?? "")
  result = result.replace(/\{\{phone\}\}/g, mergeData.contact.phone ?? "")

  // 3. Replace store merge tags
  result = result.replace(/\{\{store_name\}\}/g, mergeData.store.name ?? "")
  result = result.replace(/\{\{store_url\}\}/g, mergeData.store.url ?? "")

  // 4. Replace order merge tags
  if (mergeData.order) {
    result = result.replace(/\{\{order_number\}\}/g, mergeData.order.order_number ?? "")
    result = result.replace(/\{\{order_total\}\}/g, mergeData.order.order_total ?? "")
    result = result.replace(/\{\{order_tracking_url\}\}/g, mergeData.order.tracking_url ?? "")
  }

  // 5. Replace cart merge tags
  if (mergeData.cart) {
    result = result.replace(/\{\{cart_items\}\}/g, mergeData.cart.items ?? "")
    result = result.replace(/\{\{cart_total\}\}/g, mergeData.cart.total ?? "")
    result = result.replace(/\{\{cart_url\}\}/g, mergeData.cart.url ?? "")
  }

  // 6. Replace product merge tags
  if (mergeData.product) {
    result = result.replace(/\{\{product_name\}\}/g, mergeData.product.name ?? "")
    result = result.replace(/\{\{product_image\}\}/g, mergeData.product.image ?? "")
    result = result.replace(/\{\{product_price\}\}/g, mergeData.product.price ?? "")
    result = result.replace(/\{\{product_url\}\}/g, mergeData.product.url ?? "")
  }

  // 7. Replace recommended products
  if (mergeData.recommended_products_html) {
    result = result.replace(
      /\{\{recommended_products\}\}/g,
      mergeData.recommended_products_html
    )
  }

  // 8. Replace discount code
  if (mergeData.discount_code) {
    result = result.replace(/\{\{discount_code\}\}/g, mergeData.discount_code)
  }

  // 9. Inject tracking pixel if emailSendId provided
  if (emailSendId) {
    const pixelUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/t/o/${emailSendId}`
    const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`
    result = result.replace("</body>", `${pixel}</body>`)
  }

  // 10. Clean up any remaining unreplaced merge tags
  result = result.replace(/\{\{[a-z_]+\}\}/g, "")

  return result
}

/**
 * Replace merge tags in subject line
 */
export function prepareSubject(subject: string, mergeData: MergeData): string {
  let result = subject
  result = result.replace(/\{\{first_name\}\}/g, mergeData.contact.first_name ?? "")
  result = result.replace(/\{\{last_name\}\}/g, mergeData.contact.last_name ?? "")
  result = result.replace(/\{\{store_name\}\}/g, mergeData.store.name ?? "")
  if (mergeData.discount_code) {
    result = result.replace(/\{\{discount_code\}\}/g, mergeData.discount_code)
  }
  if (mergeData.order) {
    result = result.replace(/\{\{order_number\}\}/g, mergeData.order.order_number ?? "")
  }
  return result
}
