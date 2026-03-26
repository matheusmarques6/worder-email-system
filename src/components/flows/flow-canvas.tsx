"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerNode } from "./nodes/trigger-node";
import { EmailNode } from "./nodes/email-node";
import { WhatsappNode } from "./nodes/whatsapp-node";
import { DelayNode } from "./nodes/delay-node";
import { ConditionNode } from "./nodes/condition-node";
import type { FlowNodeData } from "@/types/flows";

const nodeTypes = {
  trigger: TriggerNode,
  send_email: EmailNode,
  send_whatsapp: WhatsappNode,
  time_delay: DelayNode,
  conditional: ConditionNode,
};

interface FlowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

function FlowCanvasInner({
  initialNodes = [],
  initialEdges = [],
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 75,
        y: event.clientY - bounds.top - 25,
      };

      const nodeData: FlowNodeData = {
        type: type as FlowNodeData["type"],
        label: getNodeLabel(type),
        config: {},
      };

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: nodeData as unknown as Record<string, unknown>,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
      >
        <Controls />
        <MiniMap
          nodeStrokeColor="#E5E7EB"
          nodeColor="#F9FAFB"
          nodeBorderRadius={8}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
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

function getNodeLabel(type: string): string {
  const labels: Record<string, string> = {
    trigger: "Trigger",
    send_email: "Enviar Email",
    send_whatsapp: "Enviar WhatsApp",
    time_delay: "Esperar",
    conditional: "Condição",
    split: "Divisão",
  };
  return labels[type] || type;
}
