"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const mockCampaigns = [
  { id: "1", name: "Newsletter Março", status: "sent" as const, sent_at: "2026-03-20", total_sent: 2450, total_opened: 735, total_clicked: 196 },
  { id: "2", name: "Promoção Páscoa", status: "scheduled" as const, sent_at: "2026-03-28", total_sent: 0, total_opened: 0, total_clicked: 0 },
  { id: "3", name: "Lançamento Coleção", status: "draft" as const, sent_at: null, total_sent: 0, total_opened: 0, total_clicked: 0 },
  { id: "4", name: "Reengajamento", status: "sent" as const, sent_at: "2026-03-15", total_sent: 1820, total_opened: 491, total_clicked: 127 },
];

const statusConfig = {
  sent: { label: "Enviada", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  scheduled: { label: "Agendada", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  sending: { label: "Enviando", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  failed: { label: "Falhou", className: "bg-red-50 text-red-700 border border-red-200" },
};

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockCampaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campanhas</h1>
          <p className="mt-1 text-sm text-gray-500">Crie e gerencie suas campanhas de email</p>
        </div>
        <Link href="/campaigns/new">
          <Button><Plus className="mr-2 h-4 w-4" />Nova Campanha</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar campanhas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">Todos os status</option>
          <option value="sent">Enviada</option>
          <option value="scheduled">Agendada</option>
          <option value="draft">Rascunho</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
          <Mail className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg text-gray-600">Nenhuma campanha encontrada</p>
          <p className="mt-1 text-sm text-gray-400">Envie seu primeiro email agora</p>
          <Link href="/campaigns/new" className="mt-4"><Button>Criar Campanha</Button></Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Enviados</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Abertos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const badge = statusConfig[c.status];
                return (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/campaigns/${c.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">{c.name}</Link>
                    </td>
                    <td className="px-6 py-4"><Badge variant="outline" className={badge.className}>{badge.label}</Badge></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{c.total_sent.toLocaleString("pt-BR")}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{c.total_sent > 0 ? `${((c.total_opened / c.total_sent) * 100).toFixed(1)}%` : "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{c.total_sent > 0 ? `${((c.total_clicked / c.total_sent) * 100).toFixed(1)}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
