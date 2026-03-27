"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Flow } from "@/types";

const statusConfig = {
  live: { label: "Ativo", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  draft: { label: "Rascunho", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  paused: { label: "Pausado", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
};

const triggerLabels: Record<string, string> = {
  metric: "Métrica",
  list: "Lista",
  segment: "Segmento",
  date_property: "Data",
};

export default function FlowsPage() {
  const [flows] = useState<Flow[]>([]);

  if (flows.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Automações</h1>
          <Link href="/flows/new">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus size={18} className="mr-2" />
              Criar Automação
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-24 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Zap size={18} className="text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            Nenhuma automação criada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie fluxos automáticos para seus contatos
          </p>
          <Link href="/flows/new" className="mt-4">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus size={18} className="mr-2" />
              Criar Automação
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Automações</h1>
        <Link href="/flows/new">
          <Button className="bg-brand-500 hover:bg-brand-600 text-white">
            <Plus size={18} className="mr-2" />
            Criar Automação
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trigger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Entrados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Emails Enviados
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flows.map((flow) => {
              const status =
                statusConfig[flow.status as keyof typeof statusConfig] ||
                statusConfig.draft;
              return (
                <tr key={flow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/flows/${flow.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-brand-500"
                    >
                      {flow.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {triggerLabels[flow.trigger_type] || flow.trigger_type}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className={status.className}>
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {flow.total_entered.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {flow.total_emails_sent.toLocaleString("pt-BR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
