"use client";

import { FileText } from "lucide-react";
import { toast } from "sonner";

interface StepFirstFormProps {
  onComplete: () => void;
}

export function StepFirstForm({ onComplete }: StepFirstFormProps) {
  const handleCreate = () => {
    toast.success("Formulário criado com sucesso!");
    onComplete();
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <FileText size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Criar Primeiro Formulário
          </h2>
        </div>
      </div>
      <p className="text-[14px] text-gray-500 mb-6">
        Capture leads com um popup na sua loja.
      </p>

      {/* Popup preview mockup */}
      <div className="bg-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 w-80 text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[24px]">🎉</span>
          </div>
          <h3 className="text-[18px] font-semibold text-gray-900 mb-2">
            Receba 10% de desconto
          </h3>
          <p className="text-[12px] text-gray-500 mb-4">
            Cadastre-se e ganhe um cupom exclusivo na sua primeira compra.
          </p>
          <input
            type="text"
            placeholder="Seu melhor email"
            readOnly
            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-lg mb-3 bg-white"
          />
          <div className="w-full px-4 py-2 text-[14px] bg-orange-500 text-white rounded-lg font-medium">
            Quero meu cupom
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onComplete}
          className="text-[14px] text-gray-500 hover:text-gray-700 underline"
        >
          Pular
        </button>
        <button
          onClick={handleCreate}
          className="px-4 py-2 text-[14px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
        >
          Criar Formulário
        </button>
      </div>
    </div>
  );
}
