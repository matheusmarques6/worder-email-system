import type { SupabaseClient } from "@supabase/supabase-js";
import { sendCampaignEmail } from "@/lib/email/send-campaign-email";
import { sendText } from "@/lib/whatsapp/client";
import { evaluateCondition } from "./conditions";
import type { FlowExecution, Contact, Store, Template } from "@/types";

interface FlowNodeDef {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface FlowDefinition {
  nodes: FlowNodeDef[];
  edges: Array<{ source: string; target: string; sourceHandle?: string }>;
}

export async function processNode(
  execution: FlowExecution,
  node: FlowNodeDef,
  definition: FlowDefinition,
  supabase: SupabaseClient
): Promise<void> {
  const nodeConfig = (node.data.config || {}) as Record<string, unknown>;

  switch (node.type) {
    case "send_email": {
      const templateId = nodeConfig.template_id as string;
      if (templateId) {
        const { data: template } = await supabase
          .from("templates")
          .select("*")
          .eq("id", templateId)
          .single();

        const { data: contact } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", execution.contact_id)
          .single();

        const { data: store } = await supabase
          .from("stores")
          .select("*")
          .eq("id", execution.store_id)
          .single();

        if (template && contact && store) {
          await sendCampaignEmail({
            contact: contact as Contact,
            store: store as Store,
            template: template as Template,
            campaignId: "",
            subject: (nodeConfig.subject as string) || template.subject || "",
            senderName: (nodeConfig.sender_name as string) || store.name,
            senderEmail: (nodeConfig.sender_email as string) || "noreply@convertfy.com",
          });

          await supabase.rpc("increment_flow_emails", {
            p_flow_id: execution.flow_id,
          });
        }
      }
      break;
    }

    case "send_whatsapp": {
      const { data: contact } = await supabase
        .from("contacts")
        .select("phone")
        .eq("id", execution.contact_id)
        .single();

      if (contact?.phone) {
        const message = nodeConfig.message as string;
        if (message) {
          await sendText(contact.phone, message);
        }
      }
      break;
    }

    case "time_delay": {
      const duration = (nodeConfig.duration as number) || 1;
      const unit = (nodeConfig.unit as string) || "hours";

      const delayMs = getDelayMs(duration, unit);
      const nextStepAt = new Date(Date.now() + delayMs).toISOString();

      await supabase
        .from("flow_executions")
        .update({
          status: "waiting",
          next_step_at: nextStepAt,
          current_node_id: node.id,
        })
        .eq("id", execution.id);

      return; // Don't process next node yet
    }

    case "conditional": {
      const conditionType = nodeConfig.condition_type as string;
      const conditionValue = nodeConfig.condition_value as string;

      const result = await evaluateCondition(
        conditionType,
        conditionValue,
        execution.contact_id,
        execution.store_id,
        supabase
      );

      const nextEdge = definition.edges.find(
        (e) =>
          e.source === node.id &&
          e.sourceHandle === (result ? "yes" : "no")
      );

      if (nextEdge) {
        const nextNode = definition.nodes.find(
          (n) => n.id === nextEdge.target
        );
        if (nextNode) {
          await supabase
            .from("flow_executions")
            .update({ current_node_id: nextNode.id })
            .eq("id", execution.id);

          await processNode(execution, nextNode, definition, supabase);
        }
      }
      return;
    }
  }

  // Find and process next node
  const nextEdge = definition.edges.find((e) => e.source === node.id);
  if (nextEdge) {
    const nextNode = definition.nodes.find((n) => n.id === nextEdge.target);
    if (nextNode) {
      await supabase
        .from("flow_executions")
        .update({ current_node_id: nextNode.id })
        .eq("id", execution.id);

      await processNode(execution, nextNode, definition, supabase);
      return;
    }
  }

  // No more nodes - mark as completed
  await supabase
    .from("flow_executions")
    .update({ status: "completed" })
    .eq("id", execution.id);

  await supabase.rpc("increment_flow_completed", {
    p_flow_id: execution.flow_id,
  });
}

function getDelayMs(duration: number, unit: string): number {
  switch (unit) {
    case "minutes":
      return duration * 60 * 1000;
    case "hours":
      return duration * 60 * 60 * 1000;
    case "days":
      return duration * 24 * 60 * 60 * 1000;
    default:
      return duration * 60 * 60 * 1000;
  }
}
