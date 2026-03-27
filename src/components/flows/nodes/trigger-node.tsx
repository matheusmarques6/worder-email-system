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
        selected ? "border-brand-600 ring-2 ring-brand-200" : "border-brand-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-brand-50 p-1.5">
          <Zap size={18} className="text-brand-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Trigger</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {label && (
        <p className="mt-2 text-xs text-gray-500 truncate">{label}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-brand-500 !w-3 !h-3" />
    </div>
  );
}
