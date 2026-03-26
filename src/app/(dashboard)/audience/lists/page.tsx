"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const mockLists = [
  { id: "1", name: "Newsletter", contact_count: 2450, opt_in_type: "single" as const, created_at: "2026-01-15" },
  { id: "2", name: "Clientes VIP", contact_count: 342, opt_in_type: "single" as const, created_at: "2026-02-01" },
  { id: "3", name: "Leads Site", contact_count: 1820, opt_in_type: "double" as const, created_at: "2026-01-20" },
];

export default function ListsPage() {
  const [newName, setNewName] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Listas</h1>
          <p className="mt-1 text-sm text-gray-500">Organize seus contatos em listas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Criar Lista</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar nova lista</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="mb-1.5 text-sm font-medium text-gray-700">Nome da lista</Label>
                <Input placeholder="Ex: Newsletter" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <Button className="w-full">Criar lista</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mockLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
          <List className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg text-gray-600">Nenhuma lista criada</p>
          <p className="mt-1 text-sm text-gray-400">Crie uma lista para organizar seus contatos</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contatos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Opt-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {mockLists.map((list) => (
                <tr key={list.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/audience/lists/${list.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">{list.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{list.contact_count.toLocaleString("pt-BR")}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{list.opt_in_type === "double" ? "Double opt-in" : "Single opt-in"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(list.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
