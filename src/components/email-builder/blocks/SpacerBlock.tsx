'use client';

export function SpacerBlock({ data }: { data: Record<string, unknown> }) {
  const height = (data.height as number) ?? 20;

  return (
    <div
      style={{ height }}
      className="relative"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-gray-400 bg-white px-2 rounded">
          {height}px
        </span>
      </div>
    </div>
  );
}
