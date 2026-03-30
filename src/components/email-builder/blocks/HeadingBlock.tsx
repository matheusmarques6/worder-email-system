'use client';

export function HeadingBlock({ data }: { data: Record<string, unknown> }) {
  const text = (data.text as string) ?? 'Seu Titulo Aqui';
  const level = (data.level as number) ?? 1;
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  const Tag = (`h${level}` as 'h1' | 'h2' | 'h3');

  const defaultSizes: Record<number, number> = { 1: 28, 2: 24, 3: 20 };

  return (
    <div
      style={{
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
      }}
    >
      <Tag
        style={{
          color: (style.color as string) ?? '#333333',
          fontSize: (style.fontSize as number) ?? defaultSizes[level] ?? 28,
          fontFamily: (style.fontFamily as string) ?? 'Arial, sans-serif',
          textAlign: (style.textAlign as 'left' | 'center' | 'right') ?? 'left',
          margin: 0,
          fontWeight: 'bold',
        }}
      >
        {text}
      </Tag>
    </div>
  );
}
