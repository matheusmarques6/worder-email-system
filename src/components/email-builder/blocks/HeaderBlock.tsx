'use client';

import { PanelTop } from 'lucide-react';

export function HeaderBlock({ data }: { data: Record<string, unknown>; blockId?: string }) {
  const logoUrl = (data.logoUrl as string) ?? '';
  const logoWidth = (data.logoWidth as number) ?? 150;
  const logoLinkHref = (data.logoLinkHref as string) ?? '#';
  const links = (data.links ?? []) as Array<{ text: string; href: string }>;
  const layout = (data.layout as string) ?? 'logo-left';
  const backgroundColor = (data.backgroundColor as string) ?? '#FFFFFF';
  const linkColor = (data.linkColor as string) ?? '#333333';
  const padding = (data.padding ?? { top: 20, bottom: 20, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  const isCenter = layout === 'logo-center';

  return (
    <div
      style={{
        backgroundColor,
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isCenter ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isCenter ? 'center' : 'space-between',
          gap: isCenter ? 12 : 0,
        }}
      >
        <div style={{ textAlign: isCenter ? 'center' : 'left' }}>
          {logoUrl ? (
            <a href={logoLinkHref} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo"
                style={{ width: logoWidth, height: 'auto', display: 'inline-block' }}
              />
            </a>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <PanelTop size={24} />
              <span className="text-sm">Adicione o logo da sua empresa</span>
            </div>
          )}
        </div>
        {links.length > 0 && (
          <nav style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: isCenter ? 'center' : 'flex-end' }}>
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href || '#'}
                style={{
                  color: linkColor,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {link.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
