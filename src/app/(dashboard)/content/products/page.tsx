"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Package, Search, Link2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import type { Product } from "@/types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProductsPage() {
  const { store, loading: storeLoading } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!store) return;

    async function fetchProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store!.id)
        .order("updated_at", { ascending: false });

      setProducts((data as Product[]) || []);
      setLoading(false);
    }

    fetchProducts();
  }, [store]);

  const filtered = useMemo(() => {
    if (!search) return products;
    const term = search.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.vendor && p.vendor.toLowerCase().includes(term)) ||
        (p.product_type && p.product_type.toLowerCase().includes(term))
    );
  }, [products, search]);

  const isLoading = storeLoading || loading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store?.shopify_domain) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Produtos sincronizados do Shopify
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm rounded-lg">
          <Link2 className="h-12 w-12 text-gray-400 mb-4" size={18} />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Conecte sua loja Shopify
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Conecte sua loja Shopify para importar produtos automaticamente
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/settings/integrations">
              <Link2 className="mr-2" size={18} />
              Conectar Shopify
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Produtos sincronizados do Shopify
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm rounded-lg">
          <Package className="h-12 w-12 text-gray-400 mb-4" size={18} />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhum produto encontrado
          </p>
          <p className="text-sm text-gray-500">
            Os produtos serão sincronizados automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Produtos sincronizados do Shopify
        </p>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Última Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      <Package className="text-gray-400" size={18} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>
                  {product.vendor ? (
                    <span className="text-gray-700">{product.vendor}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {product.product_type ? (
                    <Badge className="bg-gray-100 text-gray-800">
                      {product.product_type}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(product.updated_at).toLocaleDateString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
