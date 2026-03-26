interface DiscountParams {
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase?: number
  usageLimit?: number
  startsAt: string
  endsAt: string
}

interface DiscountResult {
  code: string
  price_rule_id: string
  discount_code_id: string
}

export async function createDiscount(
  store: { shopify_domain: string; shopify_access_token: string },
  params: DiscountParams
): Promise<DiscountResult | null> {
  try {
    const baseUrl = `https://${store.shopify_domain}/admin/api/2026-01`
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": store.shopify_access_token,
    }

    // 1. Create price rule
    const priceRulePayload = {
      price_rule: {
        title: params.code,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: params.type === "percentage" ? "percentage" : "fixed_amount",
        value: params.type === "percentage" ? `-${params.value}` : `-${params.value}`,
        customer_selection: "all",
        starts_at: params.startsAt,
        ends_at: params.endsAt,
        usage_limit: params.usageLimit ?? null,
        prerequisite_subtotal_range: params.minPurchase
          ? { greater_than_or_equal_to: String(params.minPurchase) }
          : null,
      },
    }

    const priceRuleRes = await fetch(`${baseUrl}/price_rules.json`, {
      method: "POST",
      headers,
      body: JSON.stringify(priceRulePayload),
    })

    if (!priceRuleRes.ok) {
      console.error("Failed to create price rule:", await priceRuleRes.text())
      return null
    }

    const priceRuleData = await priceRuleRes.json()
    const priceRuleId = priceRuleData.price_rule.id

    // 2. Create discount code
    const discountPayload = {
      discount_code: {
        code: params.code,
      },
    }

    const discountRes = await fetch(
      `${baseUrl}/price_rules/${priceRuleId}/discount_codes.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(discountPayload),
      }
    )

    if (!discountRes.ok) {
      console.error("Failed to create discount code:", await discountRes.text())
      return null
    }

    const discountData = await discountRes.json()

    return {
      code: params.code,
      price_rule_id: String(priceRuleId),
      discount_code_id: String(discountData.discount_code.id),
    }
  } catch (err) {
    console.error("Discount creation error:", err)
    return null
  }
}

/**
 * Generate a unique discount code with prefix
 */
export function generateDiscountCode(prefix = "CONV"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = prefix + "-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
