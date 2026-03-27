"use client";

import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";
export function ConditionNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { type?: string; value?: string };

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-amber-600 ring-2 ring-amber-200" : "border-amber-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-amber-50 p-1.5">
          <GitBranch size={18} className="text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Condição</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {config.type && (
        <p className="mt-2 text-xs text-gray-500 truncate">{String(config.type)}</p>
      )}
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-emerald-600 font-medium">Sim ✓</span>
        <span className="text-red-500 font-medium">Não ✗</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="!bg-emerald-500 !w-3 !h-3"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!bg-red-500 !w-3 !h-3"
        style={{ left: "70%" }}
      />
    </div>
  );
}
