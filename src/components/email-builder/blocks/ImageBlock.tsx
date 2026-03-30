'use client';

import { ImageIcon } from 'lucide-react';

export function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const url = (data.url as string) ?? '';
  const alt = (data.alt as string) ?? 'Imagem';
  const width = (data.width as number) ?? 600;
  const alignment = (data.alignment as string) ?? 'center';
  const borderRadius = (data.borderRadius as number) ?? 0;
  const padding = (data.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  const alignMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div
      style={{
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
        display: 'flex',
        justifyContent: alignMap[alignment] ?? 'center',
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          style={{
            maxWidth: width,
            width: '100%',
            borderRadius,
            display: 'block',
          }}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center bg-gray-100 text-gray-400"
          style={{
            width: Math.min(width, 560),
            height: 200,
            borderRadius,
          }}
        >
          <ImageIcon size={48} />
          <span className="text-sm mt-2">Adicione uma imagem</span>
        </div>
      )}
    </div>
  );
}
