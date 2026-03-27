import { createAdminClient } from "@/lib/supabase/admin";
import { matchesTrigger } from "./triggers";
import { processNode } from "./actions";

export async function processEvent(
  storeId: string,
  eventType: string,
  contactId: string,
  eventData: Record<string, unknown> = {}
) {
  const supabase = createAdminClient();

  // Find live flows with matching trigger
  const { data: flows } = await supabase
    .from("flows")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "live");

  if (!flows || flows.length === 0) return;

  for (const flow of flows) {
    if (!matchesTrigger(flow, eventType, eventData)) continue;

    // Check if contact already has an active execution for this flow
    const { data: existing } = await supabase
      .from("flow_executions")
      .select("id")
      .eq("flow_id", flow.id)
      .eq("contact_id", contactId)
      .in("status", ["active", "waiting"])
      .limit(1);

    if (existing && existing.length > 0) continue;

    const definition = flow.flow_definition as {
      nodes: Array<{ id: string; type: string; data: Record<string, unknown> }>;
      edges: Array<{ source: string; target: string; sourceHandle?: string }>;
    };

    // Find first node after trigger
    const triggerNode = definition.nodes.find(
      (n) => n.type === "trigger"
    );
    if (!triggerNode) continue;

    const firstEdge = definition.edges.find(
      (e) => e.source === triggerNode.id
    );
    if (!firstEdge) continue;

    const firstNode = definition.nodes.find(
      (n) => n.id === firstEdge.target
    );
    if (!firstNode) continue;

    // Create execution
    const { data: execution } = await supabase
      .from("flow_executions")
      .insert({
        flow_id: flow.id,
        contact_id: contactId,
        store_id: storeId,
        status: "active",
        current_node_id: firstNode.id,
        data: eventData,
      })
      .select()
      .single();

    if (execution) {
      // Increment flow entered count
      await supabase.rpc("increment_flow_entered", { p_flow_id: flow.id }).then(async (rpcResult) => {
        if (rpcResult.error) {
          const { data: currentFlow } = await supabase
            .from("flows")
            .select("total_entered")
            .eq("id", flow.id)
            .single();
          await supabase
            .from("flows")
            .update({ total_entered: ((currentFlow?.total_entered as number) ?? 0) + 1 })
            .eq("id", flow.id);
        }
      });

      await processNode(execution, firstNode, definition, supabase);
    }
  }
}
