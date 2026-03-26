"use client";

import { useState, useRef } from "react";
import { Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface StepImportContactsProps {
  onComplete: () => void;
}

export function StepImportContacts({ onComplete }: StepImportContactsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      toast.success(`Arquivo "${file.name}" selecionado.`);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/auth/shopify/sync", {
        method: "POST",
      });
      if (response.ok) {
        toast.success("Sincronização iniciada com sucesso!");
        onComplete();
      } else {
        toast.error("Erro ao sincronizar contatos.");
      }
    } catch {
      toast.error("Erro ao sincronizar contatos.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <Upload size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Importar Contatos
          </h2>
        </div>
      </div>
      <p className="text-[14px] text-gray-500 mb-6">
        Faça upload de um CSV ou sincronize diretamente do Shopify.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Upload CSV */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Upload size={18} className="text-gray-500" />
          </div>
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">
            Upload CSV
          </h3>
          <p className="text-[12px] text-gray-500 mb-3">
            Importe contatos a partir de um arquivo CSV
          </p>
          {selectedFile && (
            <p className="text-[12px] text-green-600 mb-2">{selectedFile}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-[14px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Selecionar arquivo
          </button>
        </div>

        {/* Sync from Shopify */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <RefreshCw size={18} className="text-gray-500" />
          </div>
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">
            Sincronizar do Shopify
          </h3>
          <p className="text-[12px] text-gray-500 mb-3">
            Importe clientes diretamente da sua loja
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1.5 text-[14px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {syncing ? "Sincronizando..." : "Sincronizar agora"}
          </button>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onComplete}
          className="text-[14px] text-gray-500 hover:text-gray-700 underline"
        >
          Pular este passo
        </button>
      </div>
    </div>
  );
}
