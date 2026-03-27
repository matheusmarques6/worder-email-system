"use client";

import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";
import {
  TriggerNode,
  EmailNode,
  WhatsAppNode,
  SMSNode,
  DelayNode,
  ConditionNode,
  WebhookNode,
} from "@/components/flows/nodes";
import type { FlowNode, FlowEdge, FlowNodeData } from "@/types/flows";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  trigger: TriggerNode,
  send_email: EmailNode,
  send_whatsapp: WhatsAppNode,
  send_sms: SMSNode,
  time_delay: DelayNode,
  conditional: ConditionNode,
  webhook: WebhookNode,
};

const defaultConfigs: Record<string, FlowNodeData["config"]> = {
  trigger: { triggerType: "metric" as const },
  send_email: { subject: "", previewText: "" },
  send_whatsapp: { type: "text" as const, message: "" },
  send_sms: { message: "" },
  time_delay: { value: 1, unit: "hours" as const },
  conditional: { type: "has_placed_order" as const },
  webhook: { url: "", method: "POST" as const },
  update_profile: { field: "", value: "" },
};

const defaultLabels: Record<string, string> = {
  trigger: "Trigger",
  send_email: "Enviar Email",
  send_whatsapp: "Enviar WhatsApp",
  send_sms: "Enviar SMS",
  time_delay: "Esperar",
  conditional: "Condição",
  webhook: "Webhook",
  update_profile: "Atualizar Perfil",
};

interface FlowCanvasProps {
  initialNodes?: FlowNode[];
  initialEdges?: FlowEdge[];
  onNodesChange?: (nodes: FlowNode[]) => void;
  onEdgesChange?: (edges: FlowEdge[]) => void;
  onNodeSelect?: (node: FlowNode | null) => void;
}

function FlowCanvasInner({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onNodeSelect,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("nodeType");
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 25,
      };

      const newNode: FlowNode = {
        id: `node_${nanoid(8)}`,
        type,
        position,
        data: {
          label: defaultLabels[type] || type,
          type: type as FlowNodeData["type"],
          config: defaultConfigs[type] || {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          if (onNodesChangeProp) {
            // Will be called after state update
          }
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          if (onEdgesChangeProp) {
            // Will be called after state update
          }
        }}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        deleteKeyCode="Delete"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#D1D5DB" />
        <Controls position="bottom-left" className="!rounded-lg !border-gray-200 !shadow-sm" />
        <MiniMap
          position="bottom-right"
          style={{ background: "transparent" }}
          maskColor="rgba(0,0,0,0.1)"
          className="!rounded-lg !border-gray-200 !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
