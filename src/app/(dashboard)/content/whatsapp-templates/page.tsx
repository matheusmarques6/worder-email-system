"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import type { WhatsappTemplate } from "@/types";

const categoryColors: Record<string, string> = {
  marketing: "bg-amber-100 text-amber-800",
  utility: "bg-blue-100 text-blue-800",
  authentication: "bg-purple-100 text-purple-800",
};

const categoryLabels: Record<string, string> = {
  marketing: "Marketing",
  utility: "Utilidade",
  authentication: "Autenticação",
};

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

interface TemplateButton {
  text: string;
  type: "url" | "phone";
  value: string;
}

export default function WhatsappTemplatesPage() {
  const { store, loading: storeLoading } = useStore();
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<"marketing" | "utility" | "authentication">("marketing");
  const [body, setBody] = useState("");
  const [buttons, setButtons] = useState<TemplateButton[]>([]);

  useEffect(() => {
    if (!store) return;

    async function fetchTemplates() {
      const supabase = createClient();
      const { data } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false });

      setTemplates((data as WhatsappTemplate[]) || []);
      setLoading(false);
    }

    fetchTemplates();
  }, [store]);

  function resetForm() {
    setName("");
    setCategory("marketing");
    setBody("");
    setButtons([]);
  }

  function addButton() {
    setButtons((prev) => [...prev, { text: "", type: "url", value: "" }]);
  }

  function updateButton(index: number, field: keyof TemplateButton, value: string) {
    setButtons((prev) =>
      prev.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      )
    );
  }

  function removeButton(index: number) {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!store || !name.trim() || !body.trim()) {
      toast.error("Preencha nome e corpo do template");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .insert({
        store_id: store.id,
        name: name.trim(),
        category,
        body: body.trim(),
        buttons: buttons.filter((b) => b.text.trim()),
        language: "pt_BR",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar template");
      setSaving(false);
      return;
    }

    setTemplates((prev) => [data as WhatsappTemplate, ...prev]);
    toast.success("Template criado com sucesso");
    resetForm();
    setDialogOpen(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("whatsapp_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir template");
      return;
    }

    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template excluído");
  }

  const isLoading = storeLoading || loading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates WhatsApp</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2" size={18} />
              Criar Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Template WhatsApp</DialogTitle>
              <DialogDescription>
                Crie um template para envio via WhatsApp Business API.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Nome
                </label>
                <Input
                  placeholder="Nome do template"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Categoria
                </label>
                <Select value={category} onValueChange={(v: "marketing" | "utility" | "authentication") => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="utility">Utilidade</SelectItem>
                    <SelectItem value="authentication">Autenticação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Corpo
                </label>
                <Textarea
                  placeholder="Use {{1}}, {{2}} para variáveis"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Botões (opcional)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addButton}
                  >
                    <Plus size={18} className="mr-1" />
                    Adicionar
                  </Button>
                </div>
                {buttons.map((btn, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Texto"
                      value={btn.text}
                      onChange={(e) => updateButton(i, "text", e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={btn.type}
                      onValueChange={(v: "url" | "phone") => updateButton(i, "type", v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={btn.type === "url" ? "https://..." : "+55..."}
                      value={btn.value}
                      onChange={(e) => updateButton(i, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeButton(i)}
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm rounded-lg">
          <MessageCircle className="h-12 w-12 text-gray-400 mb-4" size={18} />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhum template WhatsApp
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Crie templates aprovados pela Meta para enviar mensagens
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2" size={18} />
            Criar Template
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Idioma</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge className={categoryColors[template.category]}>
                      {categoryLabels[template.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[template.status]}>
                      {statusLabels[template.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.language}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil size={18} className="text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
