import { processConditionalBlocks } from "./conditional-content"

export interface MergeData {
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""

/**
 * Prepare email HTML by replacing merge tags, injecting tracking, and adding unsubscribe link
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

  // 2. Replace contact merge tags
  result = result.replace(/\{\{first_name\}\}/g, mergeData.contact.first_name ?? "")
  result = result.replace(/\{\{last_name\}\}/g, mergeData.contact.last_name ?? "")
  result = result.replace(/\{\{email\}\}/g, mergeData.contact.email ?? "")
  result = result.replace(/\{\{phone\}\}/g, mergeData.contact.phone ?? "")

  // 3. Replace store merge tags
  result = result.replace(/\{\{store_name\}\}/g, mergeData.store.name ?? "")
  result = result.replace(/\{\{store_url\}\}/g, mergeData.store.url ?? "")

  // 4. Replace order merge tags
  result = result.replace(/\{\{order_number\}\}/g, mergeData.order?.order_number ?? "")
  result = result.replace(/\{\{order_total\}\}/g, mergeData.order?.order_total ?? "")
  result = result.replace(/\{\{order_tracking_url\}\}/g, mergeData.order?.tracking_url ?? "")

  // 5. Replace cart merge tags
  result = result.replace(/\{\{cart_total\}\}/g, mergeData.cart?.total ?? "")
  result = result.replace(/\{\{cart_url\}\}/g, mergeData.cart?.url ?? "")

  // 6. Replace product merge tags
  result = result.replace(/\{\{product_name\}\}/g, mergeData.product?.name ?? "")
  result = result.replace(/\{\{product_image\}\}/g, mergeData.product?.image ?? "")
  result = result.replace(/\{\{product_price\}\}/g, mergeData.product?.price ?? "")
  result = result.replace(/\{\{product_url\}\}/g, mergeData.product?.url ?? "")

  // 7. Replace discount code
  result = result.replace(/\{\{discount_code\}\}/g, mergeData.discount_code ?? "")

  // 8. Replace recommended products
  if (mergeData.recommended_products_html) {
    result = result.replace(
      /\{\{recommended_products\}\}/g,
      mergeData.recommended_products_html
    )
  }

  // 9. Click tracking: rewrite all href URLs
  if (emailSendId) {
    result = result.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (_match, originalUrl: string) => {
        const trackingUrl = `${APP_URL}/api/t/c/${emailSendId}?url=${encodeURIComponent(originalUrl)}`
        return `href="${trackingUrl}"`
      }
    )
  }

  // 10. Inject unsubscribe link before </body>
  if (emailSendId) {
    const unsubscribeHtml = `<p style="text-align:center;font-size:12px;color:#999;margin-top:20px;"><a href="${APP_URL}/api/unsubscribe/${emailSendId}" style="color:#999;">Cancelar inscrição</a></p>`
    result = result.replace("</body>", `${unsubscribeHtml}</body>`)
  }

  // 11. Inject tracking pixel before </body>
  if (emailSendId) {
    const pixel = `<img src="${APP_URL}/api/t/o/${emailSendId}" width="1" height="1" style="display:none">`
    result = result.replace("</body>", `${pixel}</body>`)
  }

  // 12. Clean up any remaining unreplaced merge tags
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
  result = result.replace(/\{\{discount_code\}\}/g, mergeData.discount_code ?? "")
  result = result.replace(/\{\{order_number\}\}/g, mergeData.order?.order_number ?? "")
  result = result.replace(/\{\{product_name\}\}/g, mergeData.product?.name ?? "")
  return result
}
