'use client';

import { Globe, Hash, AtSign, PlayCircle, MessageCircle, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const socialIcons: Record<string, LucideIcon> = {
  instagram: AtSign,
  facebook: Globe,
  twitter: Hash,
  tiktok: Share2,
  youtube: PlayCircle,
  whatsapp: MessageCircle,
};

const socialColors: Record<string, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  whatsapp: '#25D366',
};

const socialLabels: Record<string, string> = {
  instagram: 'IG',
  facebook: 'FB',
  twitter: 'X',
  tiktok: 'TK',
  youtube: 'YT',
  whatsapp: 'WA',
};

export function SocialLinksBlock({ data }: { data: Record<string, unknown> }) {
  const networks = (data.networks ?? []) as Array<{ type: string; url: string }>;
  const iconSize = (data.iconSize as number) ?? 32;
  const alignment = (data.alignment as string) ?? 'center';

  const alignMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div
      style={{
        padding: '10px 20px',
        display: 'flex',
        justifyContent: alignMap[alignment] ?? 'center',
        gap: 12,
      }}
    >
      {networks.length === 0 ? (
        <p className="text-sm text-gray-400">Adicione redes sociais</p>
      ) : (
        networks.map((network, index) => {
          const Icon = socialIcons[network.type] ?? Globe;
          const color = socialColors[network.type] ?? '#333';
          const label = socialLabels[network.type] ?? '';
          return (
            <div
              key={index}
              title={label}
              style={{
                width: iconSize,
                height: iconSize,
                borderRadius: '50%',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon size={iconSize * 0.55} color="#FFFFFF" />
            </div>
          );
        })
      )}
    </div>
  );
}
