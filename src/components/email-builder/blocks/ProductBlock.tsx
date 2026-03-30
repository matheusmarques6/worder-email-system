'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { useStore } from '@/hooks/use-store';
import { ProductPickerModal } from '../modals/ProductPickerModal';

export function ProductBlock({ data, blockId }: { data: Record<string, unknown>; blockId?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const { store } = useStore();

  const product = data.product as
    | { shopifyId: string; title: string; imageUrl: string; price: string; compareAtPrice?: string; productUrl: string }
    | undefined;
  const showImage = (data.showImage as boolean) ?? true;
  const showTitle = (data.showTitle as boolean) ?? true;
  const showPrice = (data.showPrice as boolean) ?? true;
  const showButton = (data.showButton as boolean) ?? true;
  const buttonText = (data.buttonText as string) ?? 'Comprar agora';
  const buttonStyle = (data.buttonStyle ?? {}) as Record<string, unknown>;

  if (!product) {
    return (
      <>
        <div className="p-6 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 m-4 rounded-lg">
          <ShoppingBag size={32} />
          <p className="text-sm mt-2">Nenhum produto selecionado</p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-3 px-4 py-2 bg-[#F26B2A] text-white text-sm font-medium rounded-lg hover:bg-[#e05a1a] transition-colors"
          >
            Selecionar Produto
          </button>
        </div>
        {blockId && (
          <ProductPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(p) => {
              updateBlock(blockId, { product: p });
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
      <div style={{ padding: '10px 20px', textAlign: 'center' }}>
        {showImage && product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ maxWidth: '100%', height: 'auto', margin: '0 auto 10px' }}
          />
        )}
        {showTitle && (
          <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: '0 0 8px', color: '#333' }}>
            {product.title}
          </h3>
        )}
        {showPrice && (
          <div style={{ fontSize: 16, margin: '0 0 12px' }}>
            {product.compareAtPrice && (
              <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 8 }}>
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
              fontSize: (buttonStyle.fontSize as number) ?? 14,
              fontWeight: (buttonStyle.fontWeight as string) ?? 'bold',
              borderRadius: (buttonStyle.borderRadius as number) ?? 4,
              padding: '10px 20px',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            {buttonText}
          </div>
        )}
      </div>
      {blockId && (
        <ProductPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(p) => {
            updateBlock(blockId, { product: p });
            setPickerOpen(false);
          }}
          storeId={store?.id}
        />
      )}
    </>
  );
}
