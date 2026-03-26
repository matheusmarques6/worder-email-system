import type { Flow } from "@/types";

export function matchesTrigger(
  flow: Flow,
  eventType: string,
  _eventData: Record<string, unknown>
): boolean {
  const config = flow.trigger_config as {
    metric?: string;
    list_id?: string;
    segment_id?: string;
  };

  if (!config) return false;

  // Metric-based trigger
  if (config.metric) {
    return config.metric === eventType;
  }

  // List-based trigger (handled separately when contact is added to list)
  if (config.list_id) {
    return eventType === "added_to_list";
  }

  // Segment-based trigger
  if (config.segment_id) {
    return eventType === "entered_segment";
  }

  return false;
}
