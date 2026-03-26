"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Upload, Search } from "lucide-react";
import { ImportCsvDialog } from "@/components/contacts/import-csv";

const mockContacts = [
  { id: "1", first_name: "Maria", last_name: "Silva", email: "maria@email.com", phone: "+5511999001234", total_spent: 1250.9, total_orders: 5, consent_email: "subscribed" as const, created_at: "2026-02-15" },
  { id: "2", first_name: "João", last_name: "Santos", email: "joao@email.com", phone: "+5511999005678", total_spent: 890.5, total_orders: 3, consent_email: "subscribed" as const, created_at: "2026-01-20" },
  { id: "3", first_name: "Ana", last_name: "Costa", email: "ana@email.com", phone: null, total_spent: 0, total_orders: 0, consent_email: "unsubscribed" as const, created_at: "2026-03-01" },
  { id: "4", first_name: "Pedro", last_name: "Oliveira", email: "pedro@email.com", phone: "+5511999009012", total_spent: 3450.0, total_orders: 12, consent_email: "subscribed" as const, created_at: "2025-11-10" },
  { id: "5", first_name: "Carla", last_name: "Ferreira", email: "carla@email.com", phone: "+5511999003456", total_spent: 560.0, total_orders: 2, consent_email: "bounced" as const, created_at: "2026-03-10" },
];

const consentBadge = {
  subscribed: { label: "Inscrito", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  unsubscribed: { label: "Descadastrado", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  bounced: { label: "Bounced", className: "bg-red-50 text-red-700 border border-red-200" },
};

export default function ProfilesPage() {
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const filtered = mockContacts.filter(
    (c) =>
      c.first_name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Perfis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus contatos e perfis
          </p>
        </div>
        <Button onClick={() => setImportOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Importar CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
          <Users className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg text-gray-600">Nenhum contato encontrado</p>
          <p className="mt-1 text-sm text-gray-400">
            Importe seus contatos via CSV ou conecte o Shopify
          </p>
          <Button className="mt-4" onClick={() => setImportOpen(true)}>
            Importar CSV
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Gasto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pedidos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Consent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => {
                  const badge = consentBadge[contact.consent_email];
                  return (
                    <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/audience/profiles/${contact.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
                          {contact.first_name} {contact.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{contact.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{contact.phone || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">R$ {contact.total_spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{contact.total_orders}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(contact.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
