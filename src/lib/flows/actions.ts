import { createAdminClient } from "@/lib/supabase/admin"
import { sendCampaignEmail } from "@/lib/email/send-campaign-email"
import { evaluateCondition } from "./conditions"
import type {
  DelayConfig,
  ConditionConfig,
  EmailActionConfig,
  WebhookActionConfig,
  UpdateProfileConfig,
} from "@/types/flows"
import type { Contact, Store, Template } from "@/types"

interface FlowDefinition {
  nodes: Array<{
    id: string
    data: {
      type: string
      label: string
      config: Record<string, unknown>
    }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string | null
  }>
}

/**
 * Find the next node in the flow definition given a current node and optional edge label
 */
export function getNextNode(
  definition: FlowDefinition,
  currentNodeId: string,
  edgeLabel?: string
): string | null {
  const edge = edgeLabel
    ? definition.edges.find(
        (e) => e.source === currentNodeId && e.sourceHandle === edgeLabel
      )
    : definition.edges.find((e) => e.source === currentNodeId)

  return edge?.target ?? null
}

function getDelayMs(config: DelayConfig): number {
  const multipliers: Record<string, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  }
  return config.value * (multipliers[config.unit] || 60 * 60 * 1000)
}

export async function processNode(
  executionId: string,
  nodeId: string
): Promise<void> {
  const db = createAdminClient()

  const { data: executionData } = await db
    .from("flow_executions")
    .select("*, flows(*)")
    .eq("id", executionId)
    .single()

  const execution = executionData as unknown as {
    id: string
    contact_id: string
    store_id: string
    status: string
    current_node_id: string | null
    data: Record<string, unknown>
    flows: { id: string; flow_definition: Record<string, unknown>; total_emails_sent: number } | null
  } | null

  if (!execution || execution.status === "completed" || execution.status === "failed") return

  const flow = execution.flows
  if (!flow) return
  const definition = flow.flow_definition as unknown as FlowDefinition
  const node = definition.nodes.find((n) => n.id === nodeId)
  if (!node) {
    await completeExecution(executionId, flow.id)
    return
  }

  // Update current node
  await db
    .from("flow_executions")
    .update({ current_node_id: nodeId, status: "active" })
    .eq("id", executionId)

  const nodeType = node.data.type

  try {
    switch (nodeType) {
      case "send_email": {
        const config = node.data.config as unknown as EmailActionConfig

        // Fetch template
        const { data: template } = await db
          .from("templates")
          .select("*")
          .eq("id", config.templateId || "")
          .single()

        // Fetch contact
        const { data: contact } = await db
          .from("contacts")
          .select("*")
          .eq("id", execution.contact_id)
          .eq("store_id", execution.store_id)
          .single()

        // Fetch store
        const { data: store } = await db
          .from("stores")
          .select("*")
          .eq("id", execution.store_id)
          .single()

        if (template && contact && store) {
          // Override subject if configured in the node
          const templateWithSubject: Template = {
            ...(template as unknown as Template),
            subject: config.subject || (template as unknown as Template).subject,
          }

          const eventData = execution.data as Record<string, string> | undefined

          await sendCampaignEmail(
            contact as unknown as Contact,
            templateWithSubject,
            store as unknown as Store,
            undefined,
            flow.id,
            executionId,
            eventData
          )

          // Increment flow emails_sent
          await db
            .from("flows")
            .update({ total_emails_sent: (flow.total_emails_sent || 0) + 1 })
            .eq("id", flow.id)
        }

        await advanceToNext(executionId, nodeId, definition, flow.id)
        break
      }

      case "send_sms": {
        // Placeholder: log SMS send
        console.log(`[Flow] SMS send placeholder for contact ${execution.contact_id} in execution ${executionId}`)
        await advanceToNext(executionId, nodeId, definition, flow.id)
        break
      }

      case "send_whatsapp": {
        // Placeholder: log WhatsApp send
        console.log(`[Flow] WhatsApp send placeholder for contact ${execution.contact_id} in execution ${executionId}`)
        await advanceToNext(executionId, nodeId, definition, flow.id)
        break
      }

      case "time_delay": {
        const config = node.data.config as unknown as DelayConfig
        const delayMs = getDelayMs(config)
        const nextStepAt = new Date(Date.now() + delayMs).toISOString()

        await db
          .from("flow_executions")
          .update({
            status: "waiting",
            next_step_at: nextStepAt,
          })
          .eq("id", executionId)
        // Stop processing - cron will pick it up
        return
      }

      case "conditional": {
        const config = node.data.config as unknown as ConditionConfig
        const result = await evaluateCondition(
          config,
          execution.contact_id,
          execution.store_id,
          execution.data
        )
        const handleId = result ? "yes" : "no"
        const nextNodeId = getNextNode(definition, nodeId, handleId)
        if (nextNodeId) {
          await processNode(executionId, nextNodeId)
        } else {
          await completeExecution(executionId, flow.id)
        }
        return
      }

      case "webhook": {
        const config = node.data.config as unknown as WebhookActionConfig
        if (config.url) {
          // Fetch contact data for webhook payload
          const { data: contact } = await db
            .from("contacts")
            .select("*")
            .eq("id", execution.contact_id)
            .eq("store_id", execution.store_id)
            .single()

          try {
            await fetch(config.url, {
              method: config.method || "POST",
              headers: {
                "Content-Type": "application/json",
                ...config.headers,
              },
              body: JSON.stringify({
                contact_id: execution.contact_id,
                contact: contact || undefined,
                flow_id: flow.id,
                execution_id: executionId,
                event_data: execution.data,
              }),
            })
          } catch (err) {
            console.error("[Flow] Webhook failed:", err)
          }
        }
        await advanceToNext(executionId, nodeId, definition, flow.id)
        break
      }

      case "update_profile": {
        const config = node.data.config as unknown as UpdateProfileConfig
        if (config.field && config.value) {
          await db
            .from("contacts")
            .update({ [config.field]: config.value })
            .eq("id", execution.contact_id)
            .eq("store_id", execution.store_id)
        }
        await advanceToNext(executionId, nodeId, definition, flow.id)
        break
      }

      default:
        await advanceToNext(executionId, nodeId, definition, flow.id)
    }
  } catch (err) {
    console.error(`[Flow] Node processing error:`, err)
    await db
      .from("flow_executions")
      .update({ status: "failed" })
      .eq("id", executionId)
  }
}

async function advanceToNext(
  executionId: string,
  currentNodeId: string,
  definition: FlowDefinition,
  flowId: string
) {
  const nextNodeId = getNextNode(definition, currentNodeId)
  if (nextNodeId) {
    await processNode(executionId, nextNodeId)
  } else {
    await completeExecution(executionId, flowId)
  }
}

async function completeExecution(executionId: string, flowId?: string) {
  const db = createAdminClient()
  await db
    .from("flow_executions")
    .update({ status: "completed", current_node_id: null })
    .eq("id", executionId)

  if (flowId) {
    // Increment total_completed via raw update
    const { data: flow } = await db
      .from("flows")
      .select("total_completed")
      .eq("id", flowId)
      .single()

    if (flow) {
      await db
        .from("flows")
        .update({ total_completed: ((flow as Record<string, unknown>).total_completed as number || 0) + 1 })
        .eq("id", flowId)
    }
  }
}
