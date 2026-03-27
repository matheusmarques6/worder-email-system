import type { SupabaseClient } from "@supabase/supabase-js";

export async function evaluateCondition(
  conditionType: string,
  conditionValue: string,
  contactId: string,
  storeId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  switch (conditionType) {
    case "has_placed_order": {
      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeId)
        .eq("contact_id", contactId)
        .eq("event_type", "placed_order");
      return (count || 0) > 0;
    }

    case "has_opened_email": {
      const { count } = await supabase
        .from("email_sends")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeId)
        .eq("contact_id", contactId)
        .not("opened_at", "is", null);
      return (count || 0) > 0;
    }

    case "property_equals": {
      const [property, value] = conditionValue.split("=");
      const { data: contact } = await supabase
        .from("contacts")
        .select(property)
        .eq("id", contactId)
        .single();
      return contact ? (contact as unknown as Record<string, unknown>)[property] === value : false;
    }

    case "total_spent_greater_than": {
      const threshold = parseFloat(conditionValue);
      const { data: contact } = await supabase
        .from("contacts")
        .select("total_spent")
        .eq("id", contactId)
        .single();
      return (contact?.total_spent || 0) > threshold;
    }

    case "in_list": {
      const { count } = await supabase
        .from("list_members")
        .select("*", { count: "exact", head: true })
        .eq("list_id", conditionValue)
        .eq("contact_id", contactId);
      return (count || 0) > 0;
    }

    case "in_segment": {
      // Segment evaluation is more complex - simplified here
      return false;
    }

    default:
      return false;
  }
}
