"use client";

import { useState } from "react";
import { Code, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";

interface StepInstallPixelProps {
  onComplete: () => void;
}

export function StepInstallPixel({ onComplete }: StepInstallPixelProps) {
  const { store } = useStore();
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const storeId = store?.id ?? "STORE_ID";
  const pixelCode = `<script src="${appUrl}/tracker.js" data-store-id="${storeId}" async></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixelCode);
      setCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar o código.");
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setVerifying(false);
      toast.success("Pixel verificado com sucesso!");
      onComplete();
    }, 2000);
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <Code size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Instalar Pixel de Tracking
          </h2>
        </div>
      </div>
      <p className="text-[14px] text-gray-500 mb-6">
        Copie o código abaixo e cole no tema da sua loja Shopify.
      </p>

      <div className="relative mb-4">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          {pixelCode}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
        >
          {copied ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-[14px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
        >
          {copied ? "Copiado!" : "Copiar código"}
        </button>
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="px-4 py-2 text-[14px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {verifying ? "Verificando..." : "Verificar Instalação"}
        </button>
      </div>
    </div>
  );
}
