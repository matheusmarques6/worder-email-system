"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";
import type { FlowNodeData } from "@/types/flows";

export function DelayNode({ data }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  const duration = nodeData.config?.duration as number || 1;
  const unit = nodeData.config?.unit as string || "dias";

  return (
    <div className="min-w-[180px] rounded-lg border-2 border-gray-300 bg-white shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <div className="flex items-center gap-2 rounded-t-md bg-gray-50 px-3 py-2">
        <Clock className="h-4 w-4 text-gray-600" />
        <span className="text-xs font-semibold text-gray-700">ESPERAR</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm text-gray-700">
          {duration} {unit}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  );
}
