'use client';

export function ColumnsBlock({ data }: { data: Record<string, unknown> }) {
  const layout = (data.layout as string) ?? '50-50';
  const gap = (data.gap as number) ?? 10;
  const columns = (data.columns ?? []) as Array<{ width: string }>;

  const layoutWidths: Record<string, string[]> = {
    '50-50': ['50%', '50%'],
    '33-33-33': ['33.33%', '33.33%', '33.33%'],
    '66-33': ['66.66%', '33.33%'],
    '33-66': ['33.33%', '66.66%'],
  };

  const widths = layoutWidths[layout] ?? layoutWidths['50-50'];

  return (
    <div
      style={{
        display: 'flex',
        gap,
        padding: '10px 20px',
      }}
    >
      {widths.map((width, index) => (
        <div
          key={index}
          style={{
            width,
            minHeight: 80,
            border: '1px dashed #DDD',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="text-gray-400 text-xs"
        >
          {columns[index]?.width ?? width}
        </div>
      ))}
    </div>
  );
}
