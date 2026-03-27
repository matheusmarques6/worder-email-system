import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ConditionConfig } from "@/types/flows";

export async function evaluateCondition(
  condition: ConditionConfig,
  contactId: string,
  storeId: string
): Promise<boolean> {
  const db = supabaseAdmin;
  switch (condition.type) {
    case "has_placed_order": {
      const { count } = await db
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("contact_id", contactId)
        .eq("store_id", storeId)
        .eq("type", "placed_order");
      return (count || 0) > 0;
    }

    case "has_opened_email": {
      const { count } = await db
        .from("email_sends")
        .select("*", { count: "exact", head: true })
        .eq("contact_id", contactId)
        .eq("store_id", storeId)
        .not("opened_at", "is", null);
      return (count || 0) > 0;
    }

    case "property_equals": {
      const { data: contact } = await db
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .single();
      if (!contact || !condition.field) return false;
      const contactRecord = contact as Record<string, unknown>;
      return String(contactRecord[condition.field]) === condition.value;
    }

    case "total_spent_gt": {
      const { data: contact } = await db
        .from("contacts")
        .select("total_spent")
        .eq("id", contactId)
        .single();
      return (contact?.total_spent || 0) > Number(condition.value || 0);
    }

    case "in_list": {
      const { count } = await db
        .from("list_members")
        .select("*", { count: "exact", head: true })
        .eq("contact_id", contactId)
        .eq("list_id", condition.value || "");
      return (count || 0) > 0;
    }

    case "financial_status_equals": {
      const { data: events } = await db
        .from("events")
        .select("data")
        .eq("contact_id", contactId)
        .eq("store_id", storeId)
        .eq("type", "placed_order")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!events || events.length === 0) return false;
      const eventData = events[0].data as Record<string, unknown>;
      return eventData.financial_status === condition.value;
    }

    case "added_to_cart": {
      const { count } = await db
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("contact_id", contactId)
        .eq("store_id", storeId)
        .eq("type", "added_to_cart");
      return (count || 0) > 0;
    }

    case "left_review": {
      const { count } = await db
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("contact_id", contactId)
        .eq("store_id", storeId)
        .eq("type", "left_review");
      return (count || 0) > 0;
    }

    default:
      return false;
  }
}
