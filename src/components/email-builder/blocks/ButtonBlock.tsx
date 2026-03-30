'use client';

export function ButtonBlock({ data }: { data: Record<string, unknown> }) {
  const text = (data.text as string) ?? 'Clique aqui';
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 12, bottom: 12, left: 24, right: 24 }) as {
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

  const isFullWidth = (style.width as string) === 'full';

  return (
    <div
      style={{
        padding: '10px 20px',
        display: 'flex',
        justifyContent: alignMap[(style.alignment as string) ?? 'center'] ?? 'center',
      }}
    >
      <div
        style={{
          backgroundColor: (style.backgroundColor as string) ?? '#F26B2A',
          color: (style.textColor as string) ?? '#FFFFFF',
          fontSize: (style.fontSize as number) ?? 16,
          fontWeight: (style.fontWeight as string) ?? 'bold',
          borderRadius: (style.borderRadius as number) ?? 4,
          paddingTop: padding.top,
          paddingBottom: padding.bottom,
          paddingLeft: padding.left,
          paddingRight: padding.right,
          textAlign: 'center',
          cursor: 'pointer',
          display: 'inline-block',
          width: isFullWidth ? '100%' : 'auto',
          textDecoration: 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
}
