'use client';

export function DividerBlock({ data }: { data: Record<string, unknown> }) {
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10 }) as {
    top: number;
    bottom: number;
  };

  return (
    <div
      style={{
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <hr
        style={{
          border: 'none',
          borderTop: `${(style.thickness as number) ?? 1}px solid ${(style.color as string) ?? '#DDDDDD'}`,
          width: (style.width as string) ?? '100%',
          margin: '0 auto',
        }}
      />
    </div>
  );
}
