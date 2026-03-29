import { createAdminClient } from "@/lib/supabase/admin"
import { processNode as processNodeAction } from "./actions"
import { matchesTrigger } from "./triggers"
import type { Flow } from "@/types"

interface FlowDefinition {
  nodes: Array<{ id: string; data: { type: string } }>
  edges: Array<{ source: string; target: string }>
}

/**
 * Process an incoming event: find matching live flows and create executions
 */
export async function processEvent(
  storeId: string,
  eventType: string,
  contactId: string,
  eventData: Record<string, unknown>
): Promise<void> {
  const db = createAdminClient()

  // Find all live flows for this store
  const { data: flows, error } = await db
    .from("flows")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "live")

  if (error || !flows) return

  for (const rawFlow of flows) {
    const flow = rawFlow as unknown as Flow

    // Check if this event matches the flow trigger
    if (!matchesTrigger(flow, eventType, eventData)) continue

    // Check if contact already has active execution for this flow
    const { data: existing } = await db
      .from("flow_executions")
      .select("id")
      .eq("flow_id", flow.id)
      .eq("contact_id", contactId)
      .in("status", ["active", "waiting"])
      .limit(1)

    if (existing && existing.length > 0) continue

    // Find first node after trigger
    const definition = flow.flow_definition as unknown as FlowDefinition
    const triggerNode = definition.nodes.find((n) => n.data.type === "trigger")
    if (!triggerNode) continue

    const firstEdge = definition.edges.find((e) => e.source === triggerNode.id)
    if (!firstEdge) continue

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
      .single()

    if (execError || !execution) continue

    // Update flow entered count
    await db
      .from("flows")
      .update({ total_entered: (flow.total_entered || 0) + 1 })
      .eq("id", flow.id)

    // Start processing the first node
    await processNodeAction(execution.id as string, firstEdge.target)
  }
}

/**
 * Process a single execution's current node (called by cron)
 */
export async function processNode(
  execution: { id: string; current_node_id: string | null }
): Promise<void> {
  if (!execution.current_node_id) return

  const db = createAdminClient()

  // Find the next node after the current (delay) node
  const { data: execData } = await db
    .from("flow_executions")
    .select("*, flows(*)")
    .eq("id", execution.id)
    .single()

  if (!execData) return

  const flow = (execData as Record<string, unknown>).flows as {
    flow_definition: Record<string, unknown>
  } | null
  if (!flow) return

  const definition = flow.flow_definition as unknown as FlowDefinition
  const currentNodeId = execution.current_node_id

  // Find next edge from current node
  const nextEdge = definition.edges.find((e) => e.source === currentNodeId)

  if (nextEdge) {
    await processNodeAction(execution.id, nextEdge.target)
  } else {
    // No next node, complete
    await db
      .from("flow_executions")
      .update({ status: "completed", current_node_id: null })
      .eq("id", execution.id)
  }
}

/**
 * Advance an execution to the next node
 */
export async function advanceExecution(
  executionId: string,
  nextNodeId: string
): Promise<void> {
  const db = createAdminClient()
  await db
    .from("flow_executions")
    .update({
      current_node_id: nextNodeId,
      status: "active",
    })
    .eq("id", executionId)

  await processNodeAction(executionId, nextNodeId)
}
