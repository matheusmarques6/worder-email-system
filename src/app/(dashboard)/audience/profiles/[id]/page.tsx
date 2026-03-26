"use client";

import { ArrowLeft, Mail, ShoppingCart, Eye, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const mockContact = {
  id: "1",
  first_name: "Maria",
  last_name: "Silva",
  email: "maria@email.com",
  phone: "+5511999001234",
  city: "São Paulo",
  state: "SP",
  country: "Brasil",
  tags: ["vip", "comprador-recorrente"],
  consent_email: "subscribed" as const,
  total_spent: 1250.9,
  total_orders: 5,
  last_order_at: "2026-03-15",
  created_at: "2026-02-15",
};

const mockEvents = [
  { id: "1", type: "placed_order", data: { order_number: "1045", total_price: "299.90" }, created_at: "2026-03-15T14:30:00" },
  { id: "2", type: "email_opened", data: { subject: "Newsletter Março" }, created_at: "2026-03-12T10:15:00" },
  { id: "3", type: "email_clicked", data: { url: "https://loja.com/produto" }, created_at: "2026-03-12T10:18:00" },
  { id: "4", type: "placed_order", data: { order_number: "1032", total_price: "189.90" }, created_at: "2026-03-01T09:00:00" },
  { id: "5", type: "started_checkout", data: { total_price: "450.00" }, created_at: "2026-02-25T16:45:00" },
];

const eventIcons: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  placed_order: { icon: ShoppingCart, color: "text-emerald-600 bg-emerald-50", label: "Pedido realizado" },
  email_opened: { icon: Eye, color: "text-blue-600 bg-blue-50", label: "Email aberto" },
  email_clicked: { icon: MousePointerClick, color: "text-brand-600 bg-brand-50", label: "Link clicado" },
  started_checkout: { icon: ShoppingCart, color: "text-amber-600 bg-amber-50", label: "Checkout iniciado" },
};

export default function ContactDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/audience/profiles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {mockContact.first_name} {mockContact.last_name}
          </h1>
          <p className="text-sm text-gray-500">{mockContact.email}</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="lists">Listas/Segmentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Dados pessoais
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{mockContact.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Telefone</dt>
                  <dd className="text-sm text-gray-900">{mockContact.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Cidade</dt>
                  <dd className="text-sm text-gray-900">{mockContact.city}, {mockContact.state}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Consent</dt>
                  <dd>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Inscrito
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Métricas
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total gasto</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    R$ {mockContact.total_spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Pedidos</dt>
                  <dd className="text-sm text-gray-900">{mockContact.total_orders}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Último pedido</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(mockContact.last_order_at).toLocaleDateString("pt-BR")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Tags</dt>
                  <dd className="flex gap-1">
                    {mockContact.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                        {tag}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Atividade recente
            </h3>
            <div className="space-y-4">
              {mockEvents.map((event) => {
                const eventInfo = eventIcons[event.type] || {
                  icon: Mail,
                  color: "text-gray-600 bg-gray-50",
                  label: event.type,
                };
                const Icon = eventInfo.icon;
                return (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${eventInfo.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {eventInfo.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {JSON.stringify(event.data)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(event.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 shadow-sm">
            <Mail className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              Histórico de emails será exibido aqui
            </p>
          </div>
        </TabsContent>

        <TabsContent value="lists" className="mt-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 shadow-sm">
            <Mail className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              Listas e segmentos do contato serão exibidos aqui
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
