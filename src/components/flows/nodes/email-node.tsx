"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Mail } from "lucide-react";
import type { FlowNodeData } from "@/types/flows";

export function EmailNode({ data }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-blue-300 bg-white shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-center gap-2 rounded-t-md bg-blue-50 px-3 py-2">
        <Mail className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-semibold text-blue-700">EMAIL</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm text-gray-700">
          {nodeData.config?.templateName as string || "Selecione o template"}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
}
