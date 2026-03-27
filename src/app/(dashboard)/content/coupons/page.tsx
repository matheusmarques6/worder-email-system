"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import type { Coupon } from "@/types";

const typeLabels: Record<string, string> = {
  percentage: "Percentual",
  fixed: "Valor Fixo",
};

const typeColors: Record<string, string> = {
  percentage: "bg-amber-100 text-amber-800",
  fixed: "bg-blue-100 text-blue-800",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  expired: "Expirado",
  disabled: "Desativado",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  disabled: "bg-gray-100 text-gray-800",
};

function formatValue(type: string, value: number): string {
  if (type === "percentage") return `${value}%`;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CouponsPage() {
  const { store, loading: storeLoading } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (!store) return;

    async function fetchCoupons() {
      const supabase = createClient();
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false });

      setCoupons((data as Coupon[]) || []);
      setLoading(false);
    }

    fetchCoupons();
  }, [store]);

  function resetForm() {
    setCode("");
    setType("percentage");
    setValue("");
    setUsageLimit("");
    setExpiresAt("");
  }

  async function handleSave() {
    if (!store || !code.trim() || !value) {
      toast.error("Preencha código e valor do cupom");
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        store_id: store.id,
        code: code.trim().toUpperCase(),
        type,
        value: numValue,
        usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
        usage_count: 0,
        expires_at: expiresAt || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar cupom");
      setSaving(false);
      return;
    }

    setCoupons((prev) => [data as Coupon, ...prev]);
    toast.success("Cupom criado com sucesso");
    resetForm();
    setDialogOpen(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir cupom");
      return;
    }

    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cupom excluído");
  }

  const isLoading = storeLoading || loading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
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
        <h1 className="text-2xl font-semibold text-gray-900">Cupons</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2" size={18} />
              Criar Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Cupom</DialogTitle>
              <DialogDescription>
                Crie um cupom de desconto para usar nas campanhas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Código
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="DESCONTO20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="flex-1 font-mono uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCode(generateCode())}
                  >
                    <RefreshCw size={18} className="mr-1" />
                    Gerar
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tipo
                </Label>
                <Select
                  value={type}
                  onValueChange={(v: "percentage" | "fixed") => setType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Valor
                </Label>
                <Input
                  type="number"
                  placeholder={type === "percentage" ? "15" : "20.00"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  min="0"
                  step={type === "percentage" ? "1" : "0.01"}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Limite de uso (opcional)
                </Label>
                <Input
                  type="number"
                  placeholder="Sem limite"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Data de validade (opcional)
                </Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">
          Use <code className="bg-amber-100 px-1 rounded font-mono text-xs">{"{{coupon_code}}"}</code> nos seus emails para inserir o código automaticamente.
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm rounded-lg">
          <Ticket className="h-12 w-12 text-gray-400 mb-4" size={18} />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhum cupom criado
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Crie cupons de desconto para usar nas campanhas
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2" size={18} />
            Criar Cupom
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Válido até</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[coupon.type]}>
                      {typeLabels[coupon.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatValue(coupon.type, coupon.value)}</TableCell>
                  <TableCell>
                    {coupon.usage_limit
                      ? `${coupon.usage_count} de ${coupon.usage_limit}`
                      : `${coupon.usage_count}`}
                  </TableCell>
                  <TableCell>
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString("pt-BR")
                      : "Sem limite"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[coupon.status]}>
                      {statusLabels[coupon.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil size={18} className="text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
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
