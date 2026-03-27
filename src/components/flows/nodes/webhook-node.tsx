"use client";

import { Handle, Position } from "@xyflow/react";
import { Globe } from "lucide-react";
export function WebhookNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { url?: string };

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-indigo-600 ring-2 ring-indigo-200" : "border-indigo-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-indigo-50 p-1.5">
          <Globe size={18} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Webhook</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {config.url && (
        <p className="mt-2 text-xs text-gray-500 truncate">{String(config.url)}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </div>
  );
}
