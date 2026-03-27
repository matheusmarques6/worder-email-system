import { createAdminClient } from "@/lib/supabase/admin"
import { buildSupabaseQuery, applyProfileFilters } from "@/lib/segments/query-builder"

function getAdmin() {
  return createAdminClient()
}
import type { EventFilter } from "@/lib/segments/query-builder"
import type { RuleGroupType } from "react-querybuilder"

/**
 * Resolve event filters by querying the events table.
 * Returns contact IDs that match ALL event filter conditions.
 * Each filter checks: contacts who have {operator} {value} events of type {eventName}
 * within the optional timeframe.
 */
async function resolveEventFilters(
  eventFilters: EventFilter[],
  storeId: string,
  contactIds?: string[]
): Promise<string[] | null> {
  if (eventFilters.length === 0) return null

  let resultIds: Set<string> | null = null

  for (const filter of eventFilters) {
    // Build query on events table, grouped by contact_id
    let query = getAdmin()
      .from("events")
      .select("contact_id")
      .eq("store_id", storeId)
      .eq("event_name", filter.eventName)

    // Apply timeframe constraint if specified
    if (filter.timeframeDays !== undefined && filter.timeframeDays > 0) {
      const sinceDate = new Date(Date.now() - filter.timeframeDays * 86400000).toISOString()
      query = query.gte("created_at", sinceDate)
    }

    // Narrow down to known contact IDs if available
    if (contactIds && contactIds.length > 0) {
      query = query.in("contact_id", contactIds)
    }

    const { data: events } = await query

    // Count events per contact
    const countMap = new Map<string, number>()
    for (const event of events ?? []) {
      const cid = event.contact_id as string
      countMap.set(cid, (countMap.get(cid) ?? 0) + 1)
    }

    // Apply the operator condition to determine matching contacts
    let matchingIds: Set<string>

    if (filter.operator === "=" && filter.value === 0) {
      // Special case: contacts with ZERO events of this type
      // We need all candidate contact IDs to compute the difference
      const candidateIds = resultIds
        ? resultIds
        : contactIds
          ? new Set(contactIds)
          : null

      if (candidateIds) {
        matchingIds = new Set<string>()
        for (const id of candidateIds) {
          if (!countMap.has(id)) {
            matchingIds.add(id)
          }
        }
      } else {
        // No candidate set; fetch all contacts for the store and exclude those with events
        const { data: allContacts } = await getAdmin()
          .from("contacts")
          .select("id")
          .eq("store_id", storeId)

        matchingIds = new Set<string>()
        const contactsWithEvents = new Set(countMap.keys())
        for (const contact of allContacts ?? []) {
          if (!contactsWithEvents.has(contact.id as string)) {
            matchingIds.add(contact.id as string)
          }
        }
      }
    } else {
      matchingIds = new Set<string>()
      for (const [cid, count] of countMap) {
        let matches = false
        switch (filter.operator) {
          case "=":
            matches = count === filter.value
            break
          case "!=":
            matches = count !== filter.value
            break
          case ">":
            matches = count > filter.value
            break
          case "<":
            matches = count < filter.value
            break
          case ">=":
            matches = count >= filter.value
            break
          case "<=":
            matches = count <= filter.value
            break
          default:
            matches = count >= filter.value
        }
        if (matches) {
          matchingIds.add(cid)
        }
      }
    }

    // Intersect with previous results
    if (resultIds === null) {
      resultIds = matchingIds
    } else {
      const intersected = new Set<string>()
      for (const id of matchingIds) {
        if (resultIds.has(id)) {
          intersected.add(id)
        }
      }
      resultIds = intersected
    }
  }

  return resultIds ? Array.from(resultIds) : []
}

export async function resolveSegment(
  segmentId: string,
  storeId: string
): Promise<string[]> {
  const { data: segment } = await getAdmin()
    .from("segments")
    .select("rules")
    .eq("id", segmentId)
    .eq("store_id", storeId)
    .single()

  if (!segment?.rules) return []

  const rules = JSON.parse(segment.rules) as RuleGroupType
  const { filters, eventFilters, combinator } = buildSupabaseQuery(rules, storeId)

  let query = getAdmin()
    .from("contacts")
    .select("id")
    .eq("store_id", storeId)

  query = applyProfileFilters(query, filters, combinator)

  const { data: contacts } = await query
  let contactIds = (contacts ?? []).map((c: { id: string }) => c.id)

  // Apply event filters by intersecting with profile-matched contacts
  const eventResult = await resolveEventFilters(eventFilters, storeId, contactIds)
  if (eventResult !== null) {
    const eventSet = new Set(eventResult)
    contactIds = contactIds.filter((id) => eventSet.has(id))
  }

  return contactIds
}

export async function countSegment(
  conditions: RuleGroupType,
  storeId: string
): Promise<number> {
  const { filters, eventFilters, combinator } = buildSupabaseQuery(conditions, storeId)

  // If there are event filters, we can't use head:true count — we need actual IDs
  if (eventFilters.length > 0) {
    let query = getAdmin()
      .from("contacts")
      .select("id")
      .eq("store_id", storeId)

    query = applyProfileFilters(query, filters, combinator)

    const { data: contacts } = await query
    const contactIds = (contacts ?? []).map((c: { id: string }) => c.id)

    const eventResult = await resolveEventFilters(eventFilters, storeId, contactIds)
    if (eventResult !== null) {
      const eventSet = new Set(eventResult)
      return contactIds.filter((id) => eventSet.has(id)).length
    }
    return contactIds.length
  }

  let query = getAdmin()
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)

  query = applyProfileFilters(query, filters, combinator)

  const { count } = await query

  return count ?? 0
}

export async function getSegmentPreviewContacts(
  conditions: RuleGroupType,
  storeId: string,
  limit = 5
): Promise<Array<{ id: string; email: string; first_name: string | null; last_name: string | null }>> {
  const { filters, eventFilters, combinator } = buildSupabaseQuery(conditions, storeId)

  // If there are event filters, resolve them first to get matching IDs
  if (eventFilters.length > 0) {
    let idQuery = getAdmin()
      .from("contacts")
      .select("id")
      .eq("store_id", storeId)

    idQuery = applyProfileFilters(idQuery, filters, combinator)

    const { data: allContacts } = await idQuery
    const contactIds = (allContacts ?? []).map((c: { id: string }) => c.id)

    const eventResult = await resolveEventFilters(eventFilters, storeId, contactIds)
    let finalIds: string[]
    if (eventResult !== null) {
      const eventSet = new Set(eventResult)
      finalIds = contactIds.filter((id) => eventSet.has(id))
    } else {
      finalIds = contactIds
    }

    if (finalIds.length === 0) return []

    const { data } = await getAdmin()
      .from("contacts")
      .select("id, email, first_name, last_name")
      .in("id", finalIds.slice(0, limit))

    return data ?? []
  }

  let query = getAdmin()
    .from("contacts")
    .select("id, email, first_name, last_name")
    .eq("store_id", storeId)
    .limit(limit)

  query = applyProfileFilters(query, filters, combinator)

  const { data } = await query

  return data ?? []
}
