"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

interface ImportCsvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCsvDialog({ open, onOpenChange }: ImportCsvDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);

      Papa.parse(selectedFile, {
        preview: 6,
        complete: (results) => {
          const data = results.data as string[][];
          if (data.length > 0) {
            setHeaders(data[0]);
            setPreview(data.slice(1, 6));
          }
        },
      });
    },
    []
  );

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);

    // In production, parse full CSV and bulk insert via server action
    toast.success(
      `Importação iniciada! Processando ${file.name}...`
    );
    setImporting(false);
    onOpenChange(false);
    setFile(null);
    setPreview([]);
    setHeaders([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar contatos via CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {!file ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 hover:border-brand-500">
              <Upload className="mb-3 h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">
                Clique para selecionar ou arraste o arquivo
              </p>
              <p className="mt-1 text-xs text-gray-400">CSV até 10MB</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {headers.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Preview ({preview.length} linhas)
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          {headers.map((h, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left font-medium text-gray-500"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="px-3 py-2 text-gray-700"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setHeaders([]);
                  }}
                >
                  Trocar arquivo
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? "Importando..." : "Importar contatos"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
