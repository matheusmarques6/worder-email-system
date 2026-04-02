"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Zap, Mail, ShoppingCart, Package, CreditCard, UserPlus } from "lucide-react";

const flowTemplates = [
  {
    id: "welcome",
    name: "Série de Boas-vindas",
    description: "Série de boas-vindas para novos inscritos",
    icon: UserPlus,
    trigger: "Lista",
  },
  {
    id: "abandoned-cart",
    name: "Carrinho Abandonado",
    description: "Recupere vendas de checkouts abandonados",
    icon: ShoppingCart,
    trigger: "Checkout Iniciado",
  },
  {
    id: "post-purchase",
    name: "Pós-Compra",
    description: "Engaje clientes após a compra",
    icon: Package,
    trigger: "Pedido Criado",
  },
  {
    id: "boleto",
    name: "Recuperação Boleto",
    description: "Lembre clientes sobre boletos pendentes",
    icon: CreditCard,
    trigger: "Pedido Criado",
  },
  {
    id: "winback",
    name: "Win-back",
    description: "Reengaje clientes inativos",
    icon: Mail,
    trigger: "Segmento",
  },
];

export default function NewFlowPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name) return;
    // In production, create flow in Supabase and redirect
    router.push("/flows/1");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/flows">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Criar Automação
        </h1>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 text-sm font-medium text-gray-700">
                Nome da automação
              </Label>
              <Input
                placeholder="Ex: Welcome Series"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Templates prontos
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {flowTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedTemplate === template.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <Icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {template.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {template.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Trigger: {template.trigger}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={!name}>
            <Zap className="mr-2 h-4 w-4" />
            Criar Automação
          </Button>
        </div>
      </div>
    </div>
  );
}
