'use client';

import { ShoppingCart } from 'lucide-react';

const SAMPLE_ITEMS = [
  {
    title: 'Camiseta Premium Algodao',
    image: 'https://placehold.co/80x80/f5f5f5/999?text=Produto',
    price: 'R$ 89,90',
    quantity: 1,
  },
  {
    title: 'Tenis Esportivo Runner',
    image: 'https://placehold.co/80x80/f5f5f5/999?text=Produto',
    price: 'R$ 249,90',
    quantity: 2,
  },
];

export function AbandonedCartBlock({ data }: { data: Record<string, unknown>; blockId?: string }) {
  const showImage = (data.showImage as boolean) ?? true;
  const showTitle = (data.showTitle as boolean) ?? true;
  const showPrice = (data.showPrice as boolean) ?? true;
  const showQuantity = (data.showQuantity as boolean) ?? true;
  const buttonText = (data.buttonText as string) ?? 'Finalizar compra';
  const buttonStyle = (data.buttonStyle ?? {}) as Record<string, unknown>;
  const maxItems = (data.maxItems as number) ?? 10;

  const displayItems = SAMPLE_ITEMS.slice(0, maxItems);

  return (
    <div style={{ padding: '10px 20px' }}>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b">
          <ShoppingCart size={16} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase">Itens do carrinho (preview)</span>
        </div>
        <div className="divide-y">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3">
              {showImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <div className="flex-1 min-w-0">
                {showTitle && (
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {showPrice && (
                    <span className="text-sm font-bold text-gray-700">{item.price}</span>
                  )}
                  {showQuantity && (
                    <span className="text-xs text-gray-400">Qtd: {item.quantity}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 text-center">
          <div
            style={{
              backgroundColor: (buttonStyle.backgroundColor as string) ?? '#F26B2A',
              color: (buttonStyle.textColor as string) ?? '#FFFFFF',
              fontSize: 14,
              fontWeight: 'bold',
              borderRadius: (buttonStyle.borderRadius as number) ?? 4,
              padding: '12px 24px',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            {buttonText}
          </div>
        </div>
      </div>
    </div>
  );
}
