"use client";

import { Handle, Position } from "@xyflow/react";
import { Mail } from "lucide-react";
export function EmailNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { subject?: string };

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-blue-600 ring-2 ring-blue-200" : "border-blue-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-blue-50 p-1.5">
          <Mail size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Enviar Email</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {config.subject && (
        <p className="mt-2 text-xs text-gray-500 truncate">
          Assunto: {config.subject as string}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
}
