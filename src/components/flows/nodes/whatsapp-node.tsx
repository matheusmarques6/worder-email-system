"use client";

import { Handle, Position } from "@xyflow/react";
import { MessageCircle } from "lucide-react";
export function WhatsAppNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { type?: string; message?: string; templateName?: string };

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-[#25D366] ring-2 ring-green-200" : "border-[#25D366]"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#25D366] !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-green-50 p-1.5">
          <MessageCircle size={18} className="text-[#25D366]" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">WhatsApp</p>
          <p className="text-sm font-semibold text-gray-900">{String(data.label)}</p>
        </div>
      </div>
      {config.message && (
        <p className="mt-2 text-xs text-gray-500 truncate">{config.message as string}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#25D366] !w-3 !h-3" />
    </div>
  );
}
