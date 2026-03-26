"use client";

import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockFlows = [
  {
    id: "1",
    name: "Welcome Series",
    trigger_type: "Lista",
    status: "live" as const,
    total_entered: 1250,
    total_completed: 980,
    total_emails_sent: 3420,
  },
  {
    id: "2",
    name: "Carrinho Abandonado",
    trigger_type: "Checkout Iniciado",
    status: "live" as const,
    total_entered: 845,
    total_completed: 320,
    total_emails_sent: 1690,
  },
  {
    id: "3",
    name: "Pós-Compra",
    trigger_type: "Pedido Criado",
    status: "draft" as const,
    total_entered: 0,
    total_completed: 0,
    total_emails_sent: 0,
  },
];

const statusBadge = {
  live: {
    label: "Ativo",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  draft: {
    label: "Rascunho",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
};

export default function FlowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Automações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crie fluxos automatizados para engajar seus contatos
          </p>
        </div>
        <Link href="/flows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Automação
          </Button>
        </Link>
      </div>

      {mockFlows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
          <Zap className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg text-gray-600">
            Nenhuma automação criada
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Crie seu primeiro fluxo automatizado
          </p>
          <Link href="/flows/new" className="mt-4">
            <Button>Criar Automação</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
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
                    Entradas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Emails Enviados
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockFlows.map((flow) => {
                  const badge = statusBadge[flow.status];
                  return (
                    <tr
                      key={flow.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/flows/${flow.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-brand-600"
                        >
                          {flow.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {flow.trigger_type}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {flow.total_entered.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {flow.total_emails_sent.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
