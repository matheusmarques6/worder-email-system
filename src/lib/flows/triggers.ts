import { supabaseAdmin } from "@/lib/supabase/admin";

export async function findFlowsForEvent(
  storeId: string,
  eventType: string
) {
  const db = supabaseAdmin;
  const { data: flows } = await db
    .from("flows")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "live");

  if (!flows) return [];

  return flows.filter((flow) => {
    return matchesTrigger(flow.trigger_type, flow.trigger_config, eventType);
  });
}

export function matchesTrigger(
  triggerType: string,
  triggerConfig: Record<string, unknown>,
  eventType: string
): boolean {
  if (triggerType === "metric") {
    return triggerConfig.metric === eventType;
  }
  return false;
}
