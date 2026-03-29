import { createAdminClient } from "@/lib/supabase/admin";
import { buildSupabaseQuery, applyProfileFilters } from "@/lib/segments/query-builder";
import type { EventFilter } from "@/lib/segments/query-builder";
import type { RuleGroupType } from "react-querybuilder";

const supabaseAdmin = createAdminClient();

/**
 * Resolve event filters by querying the events table.
 * Returns contact IDs that match ALL event filter conditions.
 */
async function resolveEventFilters(
  eventFilters: EventFilter[],
  storeId: string,
  contactIds?: string[]
): Promise<string[] | null> {
  if (eventFilters.length === 0) return null;

  let resultIds: Set<string> | null = null;

  for (const filter of eventFilters) {
    let query = supabaseAdmin
      .from("events")
      .select("contact_id")
      .eq("store_id", storeId)
      .eq("event_type", filter.eventName);

    if (filter.timeframeDays !== undefined && filter.timeframeDays > 0) {
      const sinceDate = new Date(
        Date.now() - filter.timeframeDays * 86400000
      ).toISOString();
      query = query.gte("created_at", sinceDate);
    }

    if (contactIds && contactIds.length > 0) {
      query = query.in("contact_id", contactIds);
    }

    const { data: events } = await query;

    // Count events per contact
    const countMap = new Map<string, number>();
    for (const event of events ?? []) {
      const cid = event.contact_id as string;
      countMap.set(cid, (countMap.get(cid) ?? 0) + 1);
    }

    let matchingIds: Set<string>;

    if (filter.operator === "=" && filter.value === 0) {
      // Contacts with ZERO events of this type
      const candidateIds = resultIds
        ? resultIds
        : contactIds
          ? new Set(contactIds)
          : null;

      if (candidateIds) {
        matchingIds = new Set<string>();
        for (const id of candidateIds) {
          if (!countMap.has(id)) {
            matchingIds.add(id);
          }
        }
      } else {
        const { data: allContacts } = await supabaseAdmin
          .from("contacts")
          .select("id")
          .eq("store_id", storeId);

        matchingIds = new Set<string>();
        const contactsWithEvents = new Set(countMap.keys());
        for (const contact of allContacts ?? []) {
          if (!contactsWithEvents.has(contact.id as string)) {
            matchingIds.add(contact.id as string);
          }
        }
      }
    } else {
      matchingIds = new Set<string>();
      for (const [cid, count] of countMap) {
        let matches = false;
        switch (filter.operator) {
          case "=":
            matches = count === filter.value;
            break;
          case "!=":
            matches = count !== filter.value;
            break;
          case ">":
            matches = count > filter.value;
            break;
          case "<":
            matches = count < filter.value;
            break;
          case ">=":
            matches = count >= filter.value;
            break;
          case "<=":
            matches = count <= filter.value;
            break;
          default:
            matches = count >= filter.value;
        }
        if (matches) {
          matchingIds.add(cid);
        }
      }
    }

    // Intersect with previous results
    if (resultIds === null) {
      resultIds = matchingIds;
    } else {
      const intersected = new Set<string>();
      for (const id of matchingIds) {
        if (resultIds.has(id)) {
          intersected.add(id);
        }
      }
      resultIds = intersected;
    }
  }

  return resultIds ? Array.from(resultIds) : [];
}

/**
 * Resolve a segment by ID: parse rules, build query, return matching contact IDs.
 */
export async function resolveSegment(
  segmentId: string,
  storeId: string
): Promise<string[]> {
  const { data: segment } = await supabaseAdmin
    .from("segments")
    .select("rules")
    .eq("id", segmentId)
    .eq("store_id", storeId)
    .single();

  if (!segment?.rules) return [];

  const rules =
    typeof segment.rules === "string"
      ? (JSON.parse(segment.rules) as RuleGroupType)
      : (segment.rules as unknown as RuleGroupType);

  const { filters, eventFilters, combinator } = buildSupabaseQuery(
    rules,
    storeId
  );

  let query = supabaseAdmin
    .from("contacts")
    .select("id")
    .eq("store_id", storeId);

  query = applyProfileFilters(query, filters, combinator);

  const { data: contacts } = await query;
  let contactIds = (contacts ?? []).map((c: { id: string }) => c.id);

  // Apply event filters
  const eventResult = await resolveEventFilters(
    eventFilters,
    storeId,
    contactIds
  );
  if (eventResult !== null) {
    const eventSet = new Set(eventResult);
    contactIds = contactIds.filter((id) => eventSet.has(id));
  }

  return contactIds;
}

/**
 * Resolve a segment and return full contact objects.
 */
export async function resolveSegmentContacts(
  segmentId: string,
  storeId: string
) {
  const contactIds = await resolveSegment(segmentId, storeId);
  if (contactIds.length === 0) return [];

  const { data } = await supabaseAdmin
    .from("contacts")
    .select("id, email, first_name, last_name, phone, subscribed")
    .in("id", contactIds);

  return data ?? [];
}

/**
 * Count contacts matching a set of rules (without needing a saved segment).
 */
export async function countSegment(
  rules: RuleGroupType,
  storeId: string
): Promise<number> {
  const { filters, eventFilters, combinator } = buildSupabaseQuery(
    rules,
    storeId
  );

  if (eventFilters.length > 0) {
    let query = supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("store_id", storeId);

    query = applyProfileFilters(query, filters, combinator);

    const { data: contacts } = await query;
    const contactIds = (contacts ?? []).map((c: { id: string }) => c.id);

    const eventResult = await resolveEventFilters(
      eventFilters,
      storeId,
      contactIds
    );
    if (eventResult !== null) {
      const eventSet = new Set(eventResult);
      return contactIds.filter((id) => eventSet.has(id)).length;
    }
    return contactIds.length;
  }

  let query = supabaseAdmin
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  query = applyProfileFilters(query, filters, combinator);

  const { count } = await query;

  return count ?? 0;
}
