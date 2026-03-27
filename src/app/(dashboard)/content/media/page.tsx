"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Image, Upload, Trash2, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import type { Media } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { store, loading: storeLoading } = useStore();
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!store) return;

    async function fetchMedia() {
      const supabase = createClient();
      const { data } = await supabase
        .from("media")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false });

      setMediaItems((data as Media[]) || []);
      setLoading(false);
    }

    fetchMedia();
  }, [store]);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !store) return;

      setUploading(true);
      const supabase = createClient();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`Arquivo "${file.name}" não é uma imagem`);
          continue;
        }

        const fileName = `${store.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Erro ao enviar "${file.name}"`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(fileName);

        const { data: mediaRecord, error: insertError } = await supabase
          .from("media")
          .insert({
            store_id: store.id,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
          })
          .select()
          .single();

        if (insertError) {
          toast.error(`Erro ao salvar registro de "${file.name}"`);
          continue;
        }

        setMediaItems((prev) => [mediaRecord as Media, ...prev]);
      }

      toast.success("Upload concluído");
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [store]
  );

  async function handleDelete(item: Media) {
    if (!confirm("Tem certeza que deseja excluir esta mídia?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("media").delete().eq("id", item.id);

    if (error) {
      toast.error("Erro ao excluir mídia");
      return;
    }

    setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
    toast.success("Mídia excluída");
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada para a área de transferência");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
  }

  const isLoading = storeLoading || loading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <Skeleton className="h-40 rounded-none" />
              <div className="p-3 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Biblioteca de Mídia
        </h1>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2" size={18} />
          {uploading ? "Enviando..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-orange-500 bg-orange-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <Upload
          className="mx-auto text-gray-400 mb-2"
          size={18}
        />
        <p className="text-sm text-gray-500">
          Arraste e solte imagens aqui ou clique em &quot;Upload&quot;
        </p>
      </div>

      {mediaItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm rounded-lg">
          <Image className="h-12 w-12 text-gray-400 mb-4" size={18} />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhuma mídia
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Faça upload de imagens para usar nos seus templates
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="mr-2" size={18} />
            Upload
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
            >
              <div className="relative h-40">
                <img
                  src={item.file_url}
                  alt={item.file_name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyUrl(item.file_url)}
                  >
                    <Copy size={18} className="mr-1" />
                    Copiar URL
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.file_name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(item.file_size)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
