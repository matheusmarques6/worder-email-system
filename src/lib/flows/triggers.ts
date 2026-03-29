import { createAdminClient } from "@/lib/supabase/admin"
import type { Flow } from "@/types"

export async function findFlowsForEvent(
  storeId: string,
  eventType: string
): Promise<Flow[]> {
  const db = createAdminClient()
  const { data: flows } = await db
    .from("flows")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "live")

  if (!flows) return []

  return (flows as unknown as Flow[]).filter((flow) => {
    return matchesTrigger(flow, eventType)
  })
}

export function matchesTrigger(
  flow: Flow,
  eventType: string,
  eventData?: Record<string, unknown>
): boolean {
  const triggerType = flow.trigger_type
  const triggerConfig = flow.trigger_config as Record<string, unknown>

  if (triggerType === "metric") {
    return triggerConfig.metric === eventType
  }

  if (triggerType === "list") {
    // List triggers fire when a contact is added to a specific list
    return eventType === "added_to_list" && eventData?.list_id === triggerConfig.listId
  }

  if (triggerType === "segment") {
    // Segment triggers fire when a contact enters a segment
    return eventType === "entered_segment" && eventData?.segment_id === triggerConfig.segmentId
  }

  if (triggerType === "date_property") {
    return eventType === "date_property_trigger"
  }

  return false
}
