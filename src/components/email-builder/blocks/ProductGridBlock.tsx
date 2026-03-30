'use client';

import { useState } from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { useStore } from '@/hooks/use-store';
import { ProductPickerModal } from '../modals/ProductPickerModal';

interface GridProduct {
  shopifyId: string;
  title: string;
  imageUrl: string;
  price: string;
  compareAtPrice?: string;
  productUrl: string;
}

export function ProductGridBlock({ data, blockId }: { data: Record<string, unknown>; blockId?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const { store } = useStore();

  const products = (data.products ?? []) as GridProduct[];
  const columns = (data.columns as number) ?? 2;
  const showImage = (data.showImage as boolean) ?? true;
  const showTitle = (data.showTitle as boolean) ?? true;
  const showPrice = (data.showPrice as boolean) ?? true;
  const showButton = (data.showButton as boolean) ?? true;
  const buttonText = (data.buttonText as string) ?? 'Ver produto';
  const buttonStyle = (data.buttonStyle ?? {}) as Record<string, unknown>;

  const canAdd = products.length < columns;

  if (products.length === 0) {
    return (
      <>
        <div className="p-6 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 m-4 rounded-lg">
          <LayoutGrid size={32} />
          <p className="text-sm mt-2">Grid de Produtos</p>
          <p className="text-xs mt-1">Nenhum produto adicionado</p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-3 px-4 py-2 bg-[#F26B2A] text-white text-sm font-medium rounded-lg hover:bg-[#e05a1a] transition-colors"
          >
            Adicionar Produto
          </button>
        </div>
        {blockId && (
          <ProductPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(p) => {
              updateBlock(blockId, { products: [...products, p] });
              setPickerOpen(false);
            }}
            storeId={store?.id}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div style={{ padding: '10px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 16,
          }}
        >
          {products.map((product, idx) => (
            <div
              key={product.shopifyId || `${product.title}-${idx}`}
              style={{ textAlign: 'center' }}
              className="border rounded-lg p-3"
            >
              {showImage && product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  style={{ maxWidth: '100%', height: 'auto', margin: '0 auto 8px' }}
                />
              )}
              {showTitle && (
                <h4 style={{ fontSize: 14, fontWeight: 'bold', margin: '0 0 4px', color: '#333' }}>
                  {product.title}
                </h4>
              )}
              {showPrice && (
                <div style={{ fontSize: 14, margin: '0 0 8px' }}>
                  {product.compareAtPrice && (
                    <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 6 }}>
                      {product.compareAtPrice}
                    </span>
                  )}
                  <span style={{ color: '#333', fontWeight: 'bold' }}>{product.price}</span>
                </div>
              )}
              {showButton && (
                <div
                  style={{
                    backgroundColor: (buttonStyle.backgroundColor as string) ?? '#F26B2A',
                    color: (buttonStyle.textColor as string) ?? '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 'bold',
                    borderRadius: 4,
                    padding: '8px 12px',
                    display: 'inline-block',
                    cursor: 'pointer',
                  }}
                >
                  {buttonText}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (blockId) {
                    const newProducts = products.filter((_, i) => i !== idx);
                    updateBlock(blockId, { products: newProducts });
                  }
                }}
                className="mt-2 text-xs text-red-500 hover:underline block mx-auto"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-3 w-full py-2 text-sm border border-dashed border-gray-300 rounded-lg hover:border-[#F26B2A] hover:text-[#F26B2A] transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={14} />
            Adicionar Produto
          </button>
        )}
      </div>
      {blockId && (
        <ProductPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(p) => {
            updateBlock(blockId, { products: [...products, p] });
            setPickerOpen(false);
          }}
          storeId={store?.id}
        />
      )}
    </>
  );
}
