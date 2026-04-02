"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import type { FlowNodeData } from "@/types/flows";

export function TriggerNode({ data }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-orange-300 bg-white shadow-sm">
      <div className="flex items-center gap-2 rounded-t-md bg-orange-50 px-3 py-2">
        <Zap className="h-4 w-4 text-orange-600" />
        <span className="text-xs font-semibold text-orange-700">TRIGGER</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm text-gray-700">
          {nodeData.config?.triggerType as string || "Selecione o trigger"}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </div>
  );
}
