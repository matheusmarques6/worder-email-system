import type { SupabaseClient } from "@supabase/supabase-js";

interface SegmentConditions {
  combinator: "and" | "or";
  rules: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
}

export async function buildSupabaseQuery(
  conditions: SegmentConditions,
  storeId: string,
  supabase: SupabaseClient
): Promise<string[]> {
  const { combinator, rules } = conditions;

  if (rules.length === 0) return [];

  // For AND: apply all filters to one query
  // For OR: run separate queries and union results
  if (combinator === "and") {
    return resolveAndRules(rules, storeId, supabase);
  } else {
    return resolveOrRules(rules, storeId, supabase);
  }
}

async function resolveAndRules(
  rules: SegmentConditions["rules"],
  storeId: string,
  supabase: SupabaseClient
): Promise<string[]> {
  let query = supabase
    .from("contacts")
    .select("id")
    .eq("store_id", storeId);

  for (const rule of rules) {
    if (rule.field.startsWith("event:")) {
      // Event-based rules need subquery approach
      const eventType = rule.field.replace("event:", "");
      const contactIds = await getContactsWithEvent(
        eventType,
        rule.operator,
        rule.value,
        storeId,
        supabase
      );
      if (contactIds.length === 0) return [];
      query = query.in("id", contactIds);
      continue;
    }

    query = applyFilter(query, rule);
  }

  const { data } = await query;
  return (data || []).map((c) => c.id);
}

async function resolveOrRules(
  rules: SegmentConditions["rules"],
  storeId: string,
  supabase: SupabaseClient
): Promise<string[]> {
  const allIds = new Set<string>();

  for (const rule of rules) {
    if (rule.field.startsWith("event:")) {
      const eventType = rule.field.replace("event:", "");
      const ids = await getContactsWithEvent(
        eventType,
        rule.operator,
        rule.value,
        storeId,
        supabase
      );
      ids.forEach((id) => allIds.add(id));
    } else {
      let query = supabase
        .from("contacts")
        .select("id")
        .eq("store_id", storeId);
      query = applyFilter(query, rule);
      const { data } = await query;
      (data || []).forEach((c) => allIds.add(c.id));
    }
  }

  return Array.from(allIds);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilter(query: any, rule: SegmentConditions["rules"][0]) {
  const { field, operator, value } = rule;

  switch (operator) {
    case "equals":
      return query.eq(field, value);
    case "not_equals":
      return query.neq(field, value);
    case "contains":
      return query.ilike(field, `%${value}%`);
    case "greater_than":
      return query.gt(field, value);
    case "less_than":
      return query.lt(field, value);
    case "is_set":
      return query.not(field, "is", null);
    case "in_last_days": {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(value));
      return query.gte(field, daysAgo.toISOString());
    }
    default:
      return query;
  }
}

async function getContactsWithEvent(
  eventType: string,
  operator: string,
  value: string,
  storeId: string,
  supabase: SupabaseClient
): Promise<string[]> {
  if (operator === "zero") {
    // Contacts who have NOT done this event
    const { data: withEvent } = await supabase
      .from("events")
      .select("contact_id")
      .eq("store_id", storeId)
      .eq("type", eventType);

    const eventContactIds = new Set(
      (withEvent || []).map((e) => e.contact_id)
    );

    const { data: allContacts } = await supabase
      .from("contacts")
      .select("id")
      .eq("store_id", storeId);

    return (allContacts || [])
      .filter((c) => !eventContactIds.has(c.id))
      .map((c) => c.id);
  }

  // Contacts who have done this event at least N times
  const { data } = await supabase
    .from("events")
    .select("contact_id")
    .eq("store_id", storeId)
    .eq("type", eventType);

  const counts = new Map<string, number>();
  (data || []).forEach((e) => {
    counts.set(e.contact_id, (counts.get(e.contact_id) || 0) + 1);
  });

  const minCount = operator === "at_least" ? parseInt(value) : 1;
  return Array.from(counts.entries())
    .filter(([, count]) => count >= minCount)
    .map(([id]) => id);
}
