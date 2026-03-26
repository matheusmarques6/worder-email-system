"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import type { FlowNodeData } from "@/types/flows";

export function ConditionNode({ data }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  return (
    <div className="min-w-[200px] rounded-lg border-2 border-amber-300 bg-white shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-amber-500" />
      <div className="flex items-center gap-2 rounded-t-md bg-amber-50 px-3 py-2">
        <GitBranch className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">CONDIÇÃO</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm text-gray-700">
          {nodeData.config?.conditionLabel as string || "Configure a condição"}
        </p>
      </div>
      <div className="flex justify-between border-t border-gray-100 px-3 py-1.5">
        <div className="relative">
          <span className="text-xs font-medium text-emerald-600">SIM</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="!bg-emerald-500"
            style={{ left: "50%" }}
          />
        </div>
        <div className="relative">
          <span className="text-xs font-medium text-red-500">NÃO</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="!bg-red-500"
            style={{ left: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}
