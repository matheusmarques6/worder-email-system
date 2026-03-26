"use client";

import { useState } from "react";
import { Zap, ShoppingCart, Heart, Package } from "lucide-react";
import { toast } from "sonner";

interface StepFirstAutomationProps {
  onComplete: () => void;
}

const TEMPLATES = [
  {
    id: "abandoned-cart",
    name: "Carrinho Abandonado",
    description:
      "Recupere vendas com emails automáticos para quem abandonou o carrinho.",
    icon: ShoppingCart,
    recommended: true,
  },
  {
    id: "welcome",
    name: "Boas-vindas",
    description: "Envie uma série de boas-vindas para novos cadastros.",
    icon: Heart,
    recommended: false,
  },
  {
    id: "post-purchase",
    name: "Pós-compra",
    description: "Acompanhe o cliente após a primeira compra.",
    icon: Package,
    recommended: false,
  },
];

export function StepFirstAutomation({ onComplete }: StepFirstAutomationProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleActivate = () => {
    if (!selected) return;
    const template = TEMPLATES.find((t) => t.id === selected);
    toast.success(`Automação "${template?.name}" ativada com sucesso!`);
    onComplete();
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Ativar sua Primeira Automação
          </h2>
        </div>
      </div>
      <p className="text-[14px] text-gray-500 mb-6">
        Escolha um fluxo pré-configurado para começar.
      </p>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selected === template.id;

          return (
            <button
              key={template.id}
              onClick={() => setSelected(template.id)}
              className={`bg-white border rounded-lg p-4 text-left cursor-pointer transition-colors ${
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    {template.recommended && (
                      <span className="px-2 py-0.5 text-[12px] font-medium bg-orange-100 text-orange-600 rounded">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-500">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleActivate}
          disabled={!selected}
          className="px-4 py-2 text-[14px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ativar Automação
        </button>
      </div>
    </div>
  );
}
