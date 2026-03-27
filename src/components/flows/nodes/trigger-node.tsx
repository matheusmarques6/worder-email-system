"use client";

import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
export function TriggerNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { triggerType?: string; metric?: string };
  const label =
    config.metric || config.triggerType || "Selecionar trigger";

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-purple-600 ring-2 ring-purple-200" : "border-purple-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-purple-50 p-1.5">
          <Zap size={18} className="text-purple-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Trigger</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {label && (
        <p className="mt-2 text-xs text-gray-500 truncate">{label}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  );
}
