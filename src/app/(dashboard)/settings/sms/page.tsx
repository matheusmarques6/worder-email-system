"use client";

import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export default function SmsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">SMS</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure o envio de mensagens de texto
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 mb-4">
            <MessageSquare className="h-[18px] w-[18px] text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">
            Configura\u00e7\u00e3o de SMS
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            Em breve: Configure seu provedor de SMS para enviar mensagens de
            texto.
          </p>
          <Badge variant="secondary" className="mt-4 bg-gray-100 text-gray-600">
            N\u00e3o configurado
          </Badge>
        </div>
      </div>
    </div>
  );
}
