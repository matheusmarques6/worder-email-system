"use client";

import { Handle, Position } from "@xyflow/react";
import { Smartphone } from "lucide-react";
export function SMSNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { message?: string };

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-cyan-600 ring-2 ring-cyan-200" : "border-cyan-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-cyan-50 p-1.5">
          <Smartphone size={18} className="text-cyan-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">SMS</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {config.message && (
        <p className="mt-2 text-xs text-gray-500 truncate">{config.message as string}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3" />
    </div>
  );
}
