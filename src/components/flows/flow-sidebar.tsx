"use client";

import { Mail, MessageCircle, Clock, GitBranch, Users, ListFilter, BarChart3 } from "lucide-react";

interface DragItem {
  type: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const triggerItems: DragItem[] = [
  { type: "trigger", label: "Métrica", icon: BarChart3, color: "bg-purple-100 text-purple-700" },
  { type: "trigger", label: "Lista", icon: Users, color: "bg-purple-100 text-purple-700" },
  { type: "trigger", label: "Segmento", icon: ListFilter, color: "bg-purple-100 text-purple-700" },
];

const actionItems: DragItem[] = [
  { type: "send_email", label: "Email", icon: Mail, color: "bg-blue-100 text-blue-700" },
  { type: "send_whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-100 text-green-700" },
  { type: "time_delay", label: "Esperar", icon: Clock, color: "bg-gray-100 text-gray-700" },
];

const logicItems: DragItem[] = [
  { type: "conditional", label: "Condição", icon: GitBranch, color: "bg-amber-100 text-amber-700" },
];

function DragGroup({ title, items }: { title: string; items: DragItem[] }) {
  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <div className="space-y-1.5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.type}-${index}`}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className="flex cursor-grab items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-300 hover:bg-gray-50 active:cursor-grabbing"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md ${item.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-gray-700">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FlowSidebar() {
  return (
    <div className="w-60 border-r border-gray-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Componentes</h2>
      <div className="space-y-5">
        <DragGroup title="Triggers" items={triggerItems} />
        <DragGroup title="Ações" items={actionItems} />
        <DragGroup title="Lógica" items={logicItems} />
      </div>
    </div>
  );
}
