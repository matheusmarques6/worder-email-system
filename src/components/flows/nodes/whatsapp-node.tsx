"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageCircle } from "lucide-react";
import type { FlowNodeData } from "@/types/flows";

export function WhatsappNode({ data }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-green-300 bg-white shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <div className="flex items-center gap-2 rounded-t-md bg-green-50 px-3 py-2">
        <MessageCircle className="h-4 w-4 text-green-600" />
        <span className="text-xs font-semibold text-green-700">WHATSAPP</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm text-gray-700">
          {nodeData.config?.message as string || "Configure a mensagem"}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
}
