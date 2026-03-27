import { supabaseAdmin } from "@/lib/supabase/admin"

interface SegmentRule {
  field: string
  operator: string
  value: string | number | boolean
  combinator?: "and" | "or"
}

interface SegmentRules {
  combinator: "and" | "or"
  rules: SegmentRule[]
}

export async function resolveSegment(
  storeId: string,
  segmentId: string
): Promise<string[]> {
  const db = supabaseAdmin()

  const { data: segment } = await db
    .from("segments")
    .select("rules")
    .eq("id", segmentId)
    .eq("store_id", storeId)
    .single()

  if (!segment?.rules) return []

  const rules = segment.rules as unknown as SegmentRules
  return resolveSegmentRules(storeId, rules)
}

export async function resolveSegmentRules(
  storeId: string,
  rules: SegmentRules
): Promise<string[]> {
  const db = supabaseAdmin()

  if (!rules.rules || rules.rules.length === 0) {
    const { data } = await db
      .from("contacts")
      .select("id")
      .eq("store_id", storeId)
      .eq("subscribed", true)
    return (data ?? []).map((c) => c.id as string)
  }

  const resultSets: string[][] = []

  for (const rule of rules.rules) {
    let query = db
      .from("contacts")
      .select("id")
      .eq("store_id", storeId)
      .eq("subscribed", true)

    switch (rule.operator) {
      case "equals":
        query = query.eq(rule.field, rule.value)
        break
      case "not_equals":
        query = query.neq(rule.field, rule.value)
        break
      case "contains":
        query = query.ilike(rule.field, `%${rule.value}%`)
        break
      case "greater_than":
        query = query.gt(rule.field, rule.value)
        break
      case "less_than":
        query = query.lt(rule.field, rule.value)
        break
      case "is_set":
        query = query.not(rule.field, "is", null)
        break
      case "is_not_set":
        query = query.is(rule.field, null)
        break
      default:
        query = query.eq(rule.field, rule.value)
    }

    const { data } = await query
    resultSets.push((data ?? []).map((c) => c.id as string))
  }

  if (rules.combinator === "or") {
    const union = new Set(resultSets.flat())
    return Array.from(union)
  }

  // AND: intersection
  if (resultSets.length === 0) return []
  let intersection = new Set(resultSets[0])
  for (let i = 1; i < resultSets.length; i++) {
    const next = new Set(resultSets[i])
    intersection = new Set([...intersection].filter((id) => next.has(id)))
  }
  return Array.from(intersection)
}
