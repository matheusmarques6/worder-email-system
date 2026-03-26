import { supabaseAdmin } from "@/lib/supabase/admin"
import { buildSupabaseQuery, applyProfileFilters } from "@/lib/segments/query-builder"
import type { RuleGroupType } from "react-querybuilder"

export async function resolveSegment(
  segmentId: string,
  storeId: string
): Promise<string[]> {
  const { data: segment } = await supabaseAdmin
    .from("segments")
    .select("rules")
    .eq("id", segmentId)
    .eq("store_id", storeId)
    .single()

  if (!segment?.rules) return []

  const rules = JSON.parse(segment.rules) as RuleGroupType
  const { filters } = buildSupabaseQuery(rules, storeId)

  let query = supabaseAdmin
    .from("contacts")
    .select("id")
    .eq("store_id", storeId)

  query = applyProfileFilters(query, filters)

  const { data: contacts } = await query

  return (contacts ?? []).map((c: { id: string }) => c.id)
}

export async function countSegment(
  conditions: RuleGroupType,
  storeId: string
): Promise<number> {
  const { filters } = buildSupabaseQuery(conditions, storeId)

  let query = supabaseAdmin
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)

  query = applyProfileFilters(query, filters)

  const { count } = await query

  return count ?? 0
}

export async function getSegmentPreviewContacts(
  conditions: RuleGroupType,
  storeId: string,
  limit = 5
): Promise<Array<{ id: string; email: string; first_name: string | null; last_name: string | null }>> {
  const { filters } = buildSupabaseQuery(conditions, storeId)

  let query = supabaseAdmin
    .from("contacts")
    .select("id, email, first_name, last_name")
    .eq("store_id", storeId)
    .limit(limit)

  query = applyProfileFilters(query, filters)

  const { data } = await query

  return data ?? []
}
