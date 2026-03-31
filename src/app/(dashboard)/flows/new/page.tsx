"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ShoppingCart,
  Package,
  Receipt,
  UserMinus,
  Star,
  Crown,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlowTriggerType } from "@/types/flows";

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const templates: TemplateOption[] = [
  {
    id: "welcome-series",
    name: "Série de Boas-vindas",
    description: "Série de boas-vindas para novos inscritos",
    icon: Mail,
  },
  {
    id: "abandoned-cart",
    name: "Carrinho Abandonado",
    description: "Recupere vendas de checkouts incompletos",
    icon: ShoppingCart,
  },
  {
    id: "post-purchase",
    name: "Pós-Compra",
    description: "Acompanhamento após pedido realizado",
    icon: Package,
  },
  {
    id: "boleto-recovery",
    name: "Recuperação Boleto",
    description: "Lembrete para pagamentos pendentes",
    icon: Receipt,
  },
  {
    id: "win-back",
    name: "Reengajamento",
    description: "Reengaje clientes inativos",
    icon: UserMinus,
  },
  {
    id: "review-request",
    name: "Solicitação de Avaliação",
    description: "Solicite avaliações após entrega",
    icon: Star,
  },
  {
    id: "vip-upgrade",
    name: "Upgrade VIP",
    description: "Boas-vindas ao programa de fidelidade",
    icon: Crown,
  },
  {
    id: "browse-abandonment",
    name: "Navegação Abandonada",
    description: "Recupere visitantes que viram produtos",
    icon: Eye,
  },
];

export default function NewFlowPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<FlowTriggerType>("metric");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateFromScratch = () => {
    router.push("/flows/new-flow-id");
  };

  const handleUseTemplate = () => {
    router.push("/flows/new-flow-id");
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/flows"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={18} />
          Voltar para Automações
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nova Automação</h1>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Nome da Automação
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boas-vindas, Carrinho Abandonado..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tipo de Trigger
            </Label>
            <Select
              value={triggerType}
              onValueChange={(v) => setTriggerType(v as FlowTriggerType)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Métrica</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
                <SelectItem value="segment">Segmento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Templates Prontos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Selecione um template para começar rapidamente
        </p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`cursor-pointer rounded-lg border p-4 transition-colors hover:border-brand-500 ${
                isSelected
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Icon size={18} className="text-gray-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                {template.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{template.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleCreateFromScratch}
          variant="outline"
          className="border-gray-300 text-gray-700"
        >
          Criar do Zero
        </Button>
        <Button
          onClick={handleUseTemplate}
          disabled={!selectedTemplate}
          className="bg-brand-500 hover:bg-brand-600 text-white"
        >
          Usar Template
        </Button>
      </div>
    </div>
  );
}
