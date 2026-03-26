"use client";

import Link from "next/link";
import { Plus, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockSegments = [
  { id: "1", name: "Engajados (30d)", contact_count: 1250, is_prebuilt: true },
  { id: "2", name: "Não Engajados (90d+)", contact_count: 890, is_prebuilt: true },
  { id: "3", name: "Compradores Recorrentes", contact_count: 342, is_prebuilt: true },
  { id: "4", name: "Novos (7d)", contact_count: 45, is_prebuilt: true },
  { id: "5", name: "Nunca Comprou", contact_count: 1820, is_prebuilt: true },
  { id: "6", name: "Em Risco de Churn", contact_count: 567, is_prebuilt: true },
];

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Segmentos</h1>
          <p className="mt-1 text-sm text-gray-500">Segmente sua audiência com regras inteligentes</p>
        </div>
        <Link href="/audience/segments/new">
          <Button><Plus className="mr-2 h-4 w-4" />Criar Segmento</Button>
        </Link>
      </div>

      {mockSegments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
          <ListFilter className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg text-gray-600">Nenhum segmento criado</p>
          <p className="mt-1 text-sm text-gray-400">Crie segmentos para direcionar suas campanhas</p>
          <Link href="/audience/segments/new" className="mt-4"><Button>Criar Segmento</Button></Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contatos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {mockSegments.map((seg) => (
                <tr key={seg.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{seg.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{seg.contact_count.toLocaleString("pt-BR")}</td>
                  <td className="px-6 py-4">
                    {seg.is_prebuilt && (
                      <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">Pré-construído</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
