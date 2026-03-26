export type FlowTriggerType =
  | "metric"
  | "list"
  | "segment";

export type FlowNodeType =
  | "trigger"
  | "send_email"
  | "send_whatsapp"
  | "time_delay"
  | "conditional"
  | "split";

export interface FlowNodeData {
  type: FlowNodeType;
  label: string;
  config: Record<string, unknown>;
}

export interface FlowEdgeData {
  label?: string;
  condition?: "yes" | "no";
}

export interface FlowDefinition {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  data?: FlowEdgeData;
}
