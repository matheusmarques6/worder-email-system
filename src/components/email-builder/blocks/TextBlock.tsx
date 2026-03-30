'use client';

export function TextBlock({ data }: { data: Record<string, unknown> }) {
  const html = (data.html as string) ?? '<p>Digite seu texto aqui...</p>';
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  return (
    <div
      style={{
        color: (style.color as string) ?? '#333333',
        fontSize: (style.fontSize as number) ?? 16,
        fontFamily: (style.fontFamily as string) ?? 'Arial, sans-serif',
        textAlign: (style.textAlign as 'left' | 'center' | 'right') ?? 'left',
        lineHeight: (style.lineHeight as number) ?? 1.5,
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
        backgroundColor: (style.backgroundColor as string) ?? undefined,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
