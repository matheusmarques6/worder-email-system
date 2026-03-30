'use client';

import { ShoppingBag } from 'lucide-react';

export function ProductBlock({ data }: { data: Record<string, unknown> }) {
  const product = data.product as
    | { title: string; imageUrl: string; price: string; compareAtPrice?: string }
    | undefined;
  const showImage = (data.showImage as boolean) ?? true;
  const showTitle = (data.showTitle as boolean) ?? true;
  const showPrice = (data.showPrice as boolean) ?? true;
  const showButton = (data.showButton as boolean) ?? true;
  const buttonText = (data.buttonText as string) ?? 'Comprar agora';
  const buttonStyle = (data.buttonStyle ?? {}) as Record<string, unknown>;

  if (!product) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 m-4 rounded-lg">
        <ShoppingBag size={32} />
        <p className="text-sm mt-2">Selecione um produto</p>
        <p className="text-xs">Configure no painel de propriedades</p>
      </div>
    );
  }

  return (
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
  );
}
