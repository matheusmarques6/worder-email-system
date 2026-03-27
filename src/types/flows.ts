import type { Node, Edge } from "@xyflow/react";

export type FlowNodeType =
  | "trigger"
  | "send_email"
  | "send_whatsapp"
  | "send_sms"
  | "time_delay"
  | "conditional"
  | "update_profile"
  | "webhook";

export type FlowTriggerType = "metric" | "list" | "segment" | "date_property";

export type FlowStatus = "draft" | "live" | "manual" | "paused";

export type MetricEvent =
  | "placed_order"
  | "started_checkout"
  | "viewed_product"
  | "added_to_cart"
  | "order_fulfilled"
  | "customer_created";

export interface TriggerConfig {
  triggerType: FlowTriggerType;
  metric?: MetricEvent;
  listId?: string;
  segmentId?: string;
  dateProperty?: string;
}

export interface DelayConfig {
  value: number;
  unit: "minutes" | "hours" | "days" | "weeks";
}

export interface ConditionConfig {
  type:
    | "has_placed_order"
    | "has_opened_email"
    | "property_equals"
    | "total_spent_gt"
    | "in_list"
    | "in_segment"
    | "financial_status_equals"
    | "added_to_cart"
    | "left_review";
  field?: string;
  operator?: "equals" | "not_equals" | "gt" | "lt" | "contains";
  value?: string;
}

export interface EmailActionConfig {
  templateId?: string;
  subject?: string;
  previewText?: string;
}

export interface WhatsAppActionConfig {
  type: "text" | "template";
  message?: string;
  templateName?: string;
  templateParams?: string[];
}

export interface SMSActionConfig {
  message: string;
}

export interface WebhookActionConfig {
  url: string;
  method: "POST" | "GET";
  headers?: Record<string, string>;
}

export interface UpdateProfileConfig {
  field: string;
  value: string;
}

export type FlowNodeData = {
  label: string;
  type: FlowNodeType;
  config:
    | TriggerConfig
    | DelayConfig
    | ConditionConfig
    | EmailActionConfig
    | WhatsAppActionConfig
    | SMSActionConfig
    | WebhookActionConfig
    | UpdateProfileConfig;
};

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface FlowTemplate {
  name: string;
  description: string;
  category: string;
  icon: string;
  triggerType: FlowTriggerType;
  triggerConfig: TriggerConfig;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
