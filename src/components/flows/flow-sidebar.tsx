"use client";

import type { DragEvent } from "react";
import {
  Zap,
  Mail,
  MessageCircle,
  Smartphone,
  Clock,
  GitBranch,
  Globe,
  UserCog,
} from "lucide-react";

interface DraggableItem {
  type: string;
  label: string;
  icon: React.ElementType;
}

const triggerItems: DraggableItem[] = [
  { type: "trigger", label: "Métrica", icon: Zap },
];

const actionItems: DraggableItem[] = [
  { type: "send_email", label: "Enviar Email", icon: Mail },
  { type: "send_whatsapp", label: "Enviar WhatsApp", icon: MessageCircle },
  { type: "send_sms", label: "Enviar SMS", icon: Smartphone },
  { type: "time_delay", label: "Esperar", icon: Clock },
  { type: "webhook", label: "Webhook", icon: Globe },
];

const logicItems: DraggableItem[] = [
  { type: "conditional", label: "Condição", icon: GitBranch },
  { type: "update_profile", label: "Atualizar Perfil", icon: UserCog },
];

function DraggableNode({ item }: { item: DraggableItem }) {
  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData("nodeType", item.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const Icon = item.icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:cursor-grabbing"
    >
      <Icon size={18} className="text-gray-500" />
      {item.label}
    </div>
  );
}

export function FlowSidebar() {
  return (
    <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        Triggers
      </h3>
      <div className="mb-6 space-y-2">
        {triggerItems.map((item) => (
          <DraggableNode key={item.type} item={item} />
        ))}
      </div>

      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        Ações
      </h3>
      <div className="mb-6 space-y-2">
        {actionItems.map((item) => (
          <DraggableNode key={item.type} item={item} />
        ))}
      </div>

      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        Lógica
      </h3>
      <div className="space-y-2">
        {logicItems.map((item) => (
          <DraggableNode key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}
