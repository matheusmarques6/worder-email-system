import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWhatsAppText } from "@/lib/whatsapp/client";
import { sendSMS } from "@/lib/sms/client";
import { evaluateCondition } from "./conditions";
import type {
  DelayConfig,
  ConditionConfig,
  EmailActionConfig,
  WhatsAppActionConfig,
  SMSActionConfig,
  WebhookActionConfig,
  UpdateProfileConfig,
} from "@/types/flows";

interface FlowDefinition {
  nodes: Array<{
    id: string;
    data: {
      type: string;
      label: string;
      config: Record<string, unknown>;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
  }>;
}

export async function processNode(
  executionId: string,
  nodeId: string
): Promise<void> {
  const db = supabaseAdmin;
  const { data: executionData } = await db
    .from("flow_executions")
    .select("*, flows(*)")
    .eq("id", executionId)
    .single();

  const execution = executionData as unknown as {
    id: string;
    contact_id: string;
    store_id: string;
    status: string;
    current_node_id: string | null;
    data: Record<string, unknown>;
    flows: { id: string; flow_definition: Record<string, unknown> } | null;
  } | null;

  if (!execution || execution.status === "completed" || execution.status === "failed") return;

  const flow = execution.flows;
  if (!flow) return;
  const definition = flow.flow_definition as unknown as FlowDefinition;
  const node = definition.nodes.find((n) => n.id === nodeId);
  if (!node) {
    await completeExecution(executionId);
    return;
  }

  // Update current node
  await db
    .from("flow_executions")
    .update({ current_node_id: nodeId, status: "active" })
    .eq("id", executionId);

  const nodeType = node.data.type;

  try {
    switch (nodeType) {
      case "send_email": {
        const config = node.data.config as unknown as EmailActionConfig;
        // Log the email send (actual sending handled by email service)
        await db.from("email_sends").insert({
          store_id: execution.store_id,
          contact_id: execution.contact_id,
          flow_id: flow.id,
          flow_execution_id: executionId,
          template_id: config.templateId || null,
          subject: config.subject || "Sem assunto",
          status: "sent",
          sent_at: new Date().toISOString(),
        });
        await advanceToNext(executionId, nodeId, definition);
        break;
      }

      case "send_whatsapp": {
        const config = node.data.config as unknown as WhatsAppActionConfig;
        const { data: contact } = await db
          .from("contacts")
          .select("phone")
          .eq("id", execution.contact_id)
          .single();

        if (contact?.phone && config.message) {
          const { data: store } = await db
            .from("stores")
            .select("*")
            .eq("id", execution.store_id)
            .single();

          const waConfig = (store as Record<string, unknown>)?.whatsapp_config as
            | { phoneNumberId: string; accessToken: string }
            | undefined;

          if (waConfig) {
            await sendWhatsAppText(contact.phone, config.message, {
              phoneNumberId: waConfig.phoneNumberId,
              accessToken: waConfig.accessToken,
            });
          }
        }

        await db.from("whatsapp_sends").insert({
          store_id: execution.store_id,
          contact_id: execution.contact_id,
          flow_id: flow.id,
          flow_execution_id: executionId,
          phone: contact?.phone || "",
          message: config.message || null,
          template_name: config.templateName || null,
          status: "sent",
          sent_at: new Date().toISOString(),
        });
        await advanceToNext(executionId, nodeId, definition);
        break;
      }

      case "send_sms": {
        const config = node.data.config as unknown as SMSActionConfig;
        const { data: contact } = await db
          .from("contacts")
          .select("phone")
          .eq("id", execution.contact_id)
          .single();

        if (contact?.phone && config.message) {
          await sendSMS(contact.phone, config.message);
        }
        await advanceToNext(executionId, nodeId, definition);
        break;
      }

      case "time_delay": {
        const config = node.data.config as unknown as DelayConfig;
        const delayMs = getDelayMs(config);
        const nextStepAt = new Date(Date.now() + delayMs).toISOString();

        await db
          .from("flow_executions")
          .update({
            status: "waiting",
            next_step_at: nextStepAt,
          })
          .eq("id", executionId);
        // Stop processing - cron will pick it up
        return;
      }

      case "conditional": {
        const config = node.data.config as unknown as ConditionConfig;
        const result = await evaluateCondition(
          config,
          execution.contact_id,
          execution.store_id
        );
        const handleId = result ? "yes" : "no";
        const nextEdge = definition.edges.find(
          (e) => e.source === nodeId && e.sourceHandle === handleId
        );
        if (nextEdge) {
          await processNode(executionId, nextEdge.target);
        } else {
          await completeExecution(executionId);
        }
        return;
      }

      case "update_profile": {
        const config = node.data.config as unknown as UpdateProfileConfig;
        if (config.field && config.value) {
          await db
            .from("contacts")
            .update({ [config.field]: config.value })
            .eq("id", execution.contact_id);
        }
        await advanceToNext(executionId, nodeId, definition);
        break;
      }

      case "webhook": {
        const config = node.data.config as unknown as WebhookActionConfig;
        if (config.url) {
          try {
            await fetch(config.url, {
              method: config.method || "POST",
              headers: {
                "Content-Type": "application/json",
                ...config.headers,
              },
              body: JSON.stringify({
                contact_id: execution.contact_id,
                flow_id: flow.id,
                execution_id: executionId,
                data: execution.data,
              }),
            });
          } catch (err) {
            console.error("Webhook failed:", err);
          }
        }
        await advanceToNext(executionId, nodeId, definition);
        break;
      }

      default:
        await advanceToNext(executionId, nodeId, definition);
    }
  } catch (err) {
    console.error(`Flow node processing error:`, err);
    await db
      .from("flow_executions")
      .update({ status: "failed" })
      .eq("id", executionId);
  }
}

async function advanceToNext(
  executionId: string,
  currentNodeId: string,
  definition: FlowDefinition
) {
  const nextEdge = definition.edges.find((e) => e.source === currentNodeId);
  if (nextEdge) {
    await processNode(executionId, nextEdge.target);
  } else {
    await completeExecution(executionId);
  }
}

async function completeExecution(executionId: string) {
  const db = supabaseAdmin;
  await db
    .from("flow_executions")
    .update({ status: "completed", current_node_id: null })
    .eq("id", executionId);
}

function getDelayMs(config: DelayConfig): number {
  const multipliers: Record<string, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };
  return config.value * (multipliers[config.unit] || 60 * 60 * 1000);
}
