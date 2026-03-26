"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FlowCanvas } from "@/components/flows/flow-canvas";
import { FlowSidebar } from "@/components/flows/flow-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { Node, Edge } from "@xyflow/react";

const initialNodes: Node[] = [
  {
    id: "trigger_1",
    type: "trigger",
    position: { x: 250, y: 50 },
    data: {
      type: "trigger",
      label: "Trigger",
      config: { triggerType: "Checkout Iniciado" },
    },
  },
];

export default function FlowEditorPage() {
  const [status, setStatus] = useState<"draft" | "live">("draft");

  const handleSave = (nodes: Node[], edges: Edge[]) => {
    console.log("Saving flow:", { nodes, edges });
    toast.success("Automação salva com sucesso!");
  };

  const toggleStatus = () => {
    setStatus((prev) => (prev === "draft" ? "live" : "draft"));
    toast.success(
      status === "draft" ? "Automação ativada!" : "Automação pausada."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/flows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <span className="text-sm font-medium text-gray-900">
            Editor de Automação
          </span>
          <Badge
            variant="outline"
            className={
              status === "live"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }
          >
            {status === "live" ? "Ativo" : "Rascunho"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={toggleStatus}>
            {status === "draft" ? "Ativar" : "Pausar"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave([], [])}
          >
            <Save className="mr-1 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <FlowSidebar />
        <div className="flex-1">
          <FlowCanvas
            initialNodes={initialNodes}
            initialEdges={[]}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
