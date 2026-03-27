"use client";

import { Handle, Position } from "@xyflow/react";
import { Clock } from "lucide-react";
const unitLabels: Record<string, string> = {
  minutes: "minutos",
  hours: "horas",
  days: "dias",
  weeks: "semanas",
};

export function DelayNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const config = data.config as { value?: number; unit?: string };
  const delayText = config.value
    ? `Esperar ${config.value} ${unitLabels[config.unit || "hours"] || config.unit}`
    : "Configurar espera";

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-white p-4 shadow-sm ${
        selected ? "border-gray-500 ring-2 ring-gray-200" : "border-gray-400"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-gray-100 p-1.5">
          <Clock size={18} className="text-gray-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Esperar</p>
          <p className="text-sm font-semibold text-gray-900">{delayText}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
    </div>
  );
}
