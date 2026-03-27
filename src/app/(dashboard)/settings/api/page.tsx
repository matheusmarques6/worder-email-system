"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Code,
  Plus,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permission: "full" | "sending_only";
  created_at: string;
  last_used_at: string | null;
}

function maskKey(key: string): string {
  if (key.length <= 14) return key;
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ApiSettingsPage() {
  const { store } = useStore();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermission, setNewKeyPermission] = useState<"full" | "sending_only">("full");
  const [generatedKey, setGeneratedKey] = useState("");
  const [creating, setCreating] = useState(false);

  const loadKeys = useCallback(async () => {
    if (!store) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("stores")
      .select("settings")
      .eq("id", store.id)
      .single();

    const apiKeys: ApiKey[] = data?.settings?.api_keys ?? [];
    setKeys(apiKeys);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async () => {
    if (!store || !newKeyName.trim()) return;
    setCreating(true);

    const key = `ck_live_${nanoid(32)}`;
    const newApiKey: ApiKey = {
      id: nanoid(12),
      name: newKeyName.trim(),
      key,
      permission: newKeyPermission,
      created_at: new Date().toISOString(),
      last_used_at: null,
    };

    const supabase = createClient();
    const { data: current } = await supabase
      .from("stores")
      .select("settings")
      .eq("id", store.id)
      .single();

    const currentSettings = current?.settings ?? {};
    const existingKeys: ApiKey[] = currentSettings.api_keys ?? [];

    const { error } = await supabase
      .from("stores")
      .update({
        settings: {
          ...currentSettings,
          api_keys: [...existingKeys, newApiKey],
        },
      })
      .eq("id", store.id);

    setCreating(false);

    if (error) {
      toast.error("Erro ao criar chave de API");
      return;
    }

    setGeneratedKey(key);
    setCreateOpen(false);
    setSuccessOpen(true);
    setNewKeyName("");
    setNewKeyPermission("full");
    await loadKeys();
  };

  const handleRevoke = async (id: string) => {
    if (!store) return;

    const supabase = createClient();
    const { data: current } = await supabase
      .from("stores")
      .select("settings")
      .eq("id", store.id)
      .single();

    const currentSettings = current?.settings ?? {};
    const existingKeys: ApiKey[] = currentSettings.api_keys ?? [];

    const { error } = await supabase
      .from("stores")
      .update({
        settings: {
          ...currentSettings,
          api_keys: existingKeys.filter((k) => k.id !== id),
        },
      })
      .eq("id", store.id);

    if (error) {
      toast.error("Erro ao revogar chave");
    } else {
      toast.success("Chave revogada com sucesso");
      setRevokeId(null);
      await loadKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Chaves de API
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas chaves de acesso à API
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="h-[18px] w-[18px] mr-2" />
              Criar Chave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Chave de API</DialogTitle>
              <DialogDescription>
                Crie uma nova chave para integrar com a API do Convertfy Mail
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="mb-1.5 text-sm font-medium text-gray-700">
                  Nome
                </Label>
                <Input
                  placeholder="Ex: Integração com meu app"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 text-sm font-medium text-gray-700">
                  Permissão
                </Label>
                <Select
                  value={newKeyPermission}
                  onValueChange={(value: "full" | "sending_only") =>
                    setNewKeyPermission(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Completa</SelectItem>
                    <SelectItem value="sending_only">Apenas Envio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newKeyName.trim() || creating}
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                {creating ? "Criando..." : "Criar Chave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success dialog - show generated key one time only */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chave Criada com Sucesso</DialogTitle>
            <DialogDescription>
              Copie sua chave agora. Ela não será exibida novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 rounded-lg bg-gray-50 p-4 font-mono text-sm break-all flex items-center gap-2">
            <span className="flex-1">{generatedKey}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(generatedKey)}
            >
              <Copy className="h-[18px] w-[18px]" />
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setSuccessOpen(false)}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar Chave de API</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja revogar esta chave? Esta ação não pode ser
              desfeita e qualquer integração usando esta chave deixará de
              funcionar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeId && handleRevoke(revokeId)}
            >
              Revogar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {!loading && keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 mb-4">
              <Code className="h-[18px] w-[18px] text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Nenhuma chave de API
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              Crie chaves para integrar com a API do Convertfy Mail
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Último uso</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="text-sm text-gray-600">
                        {visibleKeys[apiKey.id]
                          ? apiKey.key
                          : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys[apiKey.id] ? (
                          <EyeOff className="h-[18px] w-[18px] text-gray-400" />
                        ) : (
                          <Eye className="h-[18px] w-[18px] text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-[18px] w-[18px] text-gray-400" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        apiKey.permission === "full" ? "default" : "secondary"
                      }
                      className={
                        apiKey.permission === "full"
                          ? "bg-brand-500 hover:bg-brand-600 text-white"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }
                    >
                      {apiKey.permission === "full"
                        ? "Completa"
                        : "Apenas Envio"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(apiKey.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {apiKey.last_used_at
                      ? formatDate(apiKey.last_used_at)
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setRevokeId(apiKey.id)}
                    >
                      <Trash2 className="h-[18px] w-[18px]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
