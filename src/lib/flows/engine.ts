import { supabaseAdmin } from "@/lib/supabase/admin";
import { processNode } from "./actions";

export async function processEvent(
  storeId: string,
  eventType: string,
  contactId: string,
  eventData: Record<string, unknown>
) {
  const db = supabaseAdmin();

  // Find all live flows matching this event
  const { data: flows, error } = await db
    .from("flows")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "live")
    .eq("trigger_type", "metric");

  if (error || !flows) return;

  for (const flow of flows) {
    const triggerConfig = flow.trigger_config as { metric?: string };
    if (triggerConfig.metric !== eventType) continue;

    // Check if contact already has active execution for this flow
    const { data: existing } = await db
      .from("flow_executions")
      .select("id")
      .eq("flow_id", flow.id)
      .eq("contact_id", contactId)
      .in("status", ["active", "waiting"])
      .limit(1);

    if (existing && existing.length > 0) continue;

    // Find first node after trigger
    const definition = flow.flow_definition as {
      nodes: Array<{ id: string; data: { type: string } }>;
      edges: Array<{ source: string; target: string }>;
    };

    const triggerNode = definition.nodes.find(
      (n) => n.data.type === "trigger"
    );
    if (!triggerNode) continue;

    const firstEdge = definition.edges.find(
      (e) => e.source === triggerNode.id
    );
    if (!firstEdge) continue;

    // Create execution
    const { data: execution, error: execError } = await db
      .from("flow_executions")
      .insert({
        flow_id: flow.id,
        contact_id: contactId,
        store_id: storeId,
        status: "active",
        current_node_id: firstEdge.target,
        data: eventData,
      })
      .select()
      .single();

    if (execError || !execution) continue;

    // Update flow entered count
    await db
      .from("flows")
      .update({ total_entered: (flow.total_entered || 0) + 1 })
      .eq("id", flow.id);

    // Start processing
    await processNode(execution.id, firstEdge.target);
  }
}
