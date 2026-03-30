'use client';

import { Play } from 'lucide-react';

export function VideoBlock({ data }: { data: Record<string, unknown>; blockId?: string }) {
  const thumbnailUrl = (data.thumbnailUrl as string) ?? '';
  const alt = (data.alt as string) ?? 'Video';
  const videoUrl = (data.videoUrl as string) ?? '';
  const width = (data.width as number) ?? 600;
  const padding = (data.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  if (!thumbnailUrl) {
    return (
      <div
        style={{
          paddingTop: padding.top,
          paddingBottom: padding.bottom,
          paddingLeft: padding.left,
          paddingRight: padding.right,
        }}
      >
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-12 text-gray-400">
          <Play size={40} className="mb-2" />
          <p className="text-sm">Cole a URL do video</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
        textAlign: 'center',
      }}
    >
      <a
        href={videoUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', position: 'relative', maxWidth: '100%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={alt}
          style={{ display: 'block', maxWidth: '100%', height: 'auto', width }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
        </div>
      </a>
    </div>
  );
}
