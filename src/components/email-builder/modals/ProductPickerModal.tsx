'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Product {
  shopifyId: string;
  title: string;
  imageUrl: string;
  price: string;
  compareAtPrice?: string;
  productUrl: string;
}

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  storeId: string | undefined;
}

export function ProductPickerModal({ open, onClose, onSelect, storeId }: ProductPickerModalProps) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ title: '', imageUrl: '', price: '', productUrl: '' });

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .limit(50);

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data } = await query;

      if (data) {
        setProducts(
          data.map((p: Record<string, unknown>) => ({
            shopifyId: String(p.shopify_id ?? p.id ?? ''),
            title: String(p.title ?? ''),
            imageUrl: String(p.image_url ?? p.imageUrl ?? ''),
            price: String(p.price ?? ''),
            compareAtPrice: p.compare_at_price ? String(p.compare_at_price) : undefined,
            productUrl: String(p.product_url ?? p.url ?? ''),
          }))
        );
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, search]);

  useEffect(() => {
    if (open && storeId) {
      fetchProducts();
    }
  }, [open, storeId, fetchProducts]);

  if (!open) return null;

  function handleManualSubmit() {
    if (!manual.title || !manual.price) return;
    onSelect({
      shopifyId: '',
      title: manual.title,
      imageUrl: manual.imageUrl,
      price: manual.price,
      productUrl: manual.productUrl,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Selecionar Produto</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className={`text-xs px-3 py-1 rounded-full ${!showManual ? 'bg-[#F26B2A] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Da loja
            </button>
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className={`text-xs px-3 py-1 rounded-full ${showManual ? 'bg-[#F26B2A] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Manual
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showManual ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Titulo *
                <input
                  type="text"
                  value={manual.title}
                  onChange={(e) => setManual({ ...manual, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                URL da imagem
                <input
                  type="url"
                  value={manual.imageUrl}
                  onChange={(e) => setManual({ ...manual, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Preco *
                <input
                  type="text"
                  value={manual.price}
                  onChange={(e) => setManual({ ...manual, price: e.target.value })}
                  placeholder="R$ 99,90"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                URL do produto
                <input
                  type="url"
                  value={manual.productUrl}
                  onChange={(e) => setManual({ ...manual, productUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </label>
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={!manual.title || !manual.price}
                className="w-full py-2 bg-[#F26B2A] text-white rounded-lg text-sm font-medium hover:bg-[#e05a1a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Usar este produto
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <p className="text-sm">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Package size={40} className="mb-3" />
              <p className="text-sm text-center">
                Nenhum produto encontrado. Conecte sua loja Shopify para importar produtos.
              </p>
              <a
                href="/settings/integrations"
                className="mt-2 text-sm text-[#F26B2A] hover:underline"
              >
                Ir para integracoes
              </a>
              <button
                type="button"
                onClick={() => setShowManual(true)}
                className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Ou adicione manualmente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <button
                  key={product.shopifyId || product.title}
                  type="button"
                  onClick={() => {
                    onSelect(product);
                    onClose();
                  }}
                  className="border rounded-lg p-3 text-left hover:border-[#F26B2A] hover:bg-orange-50 transition-colors"
                >
                  {product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                  <p className="text-sm text-[#F26B2A] font-bold">{product.price}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
