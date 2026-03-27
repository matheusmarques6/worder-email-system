"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FlowCanvas } from "@/components/flows/flow-canvas";
import { FlowSidebar } from "@/components/flows/flow-sidebar";
import { FlowConfigPanel } from "@/components/flows/flow-config-panel";
import type { FlowNode, FlowNodeData } from "@/types/flows";
import type { Edge } from "@xyflow/react";

export default function FlowEditorPage() {
  const [flowName, setFlowName] = useState("Nova Automação");
  const [isLive, setIsLive] = useState(false);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  const status = isLive ? "live" : "draft";

  const handleNodeSelect = useCallback((node: FlowNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleNodesChange = useCallback((updatedNodes: FlowNode[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
  }, []);

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: FlowNodeData) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, data } : n))
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId ? { ...prev, data } : prev
      );
    },
    []
  );

  const handleSave = () => {
    const flowDefinition = {
      name: flowName,
      status,
      nodes,
      edges,
    };
    console.log("Flow definition:", flowDefinition);
    toast.success("Automação salva com sucesso!");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/flows"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={18} />
          </Link>
          <Input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="h-8 w-64 border-transparent bg-transparent text-sm font-semibold text-gray-900 hover:border-gray-300 focus:border-gray-300"
          />
          <Badge
            variant="secondary"
            className={
              status === "live"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
            }
          >
            {status === "live" ? "Ativo" : "Rascunho"}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {isLive ? "Ativo" : "Rascunho"}
            </span>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
          </div>
          <Button
            onClick={handleSave}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            <Save size={18} className="mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <FlowSidebar />
        <div className="flex-1">
          <FlowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeSelect={handleNodeSelect}
          />
        </div>
        {selectedNode && (
          <FlowConfigPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
