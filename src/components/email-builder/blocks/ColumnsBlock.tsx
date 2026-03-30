'use client';

import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { BlockRenderer } from './BlockRenderer';
import type { BlockType } from '@/lib/email-builder/types';

export function ColumnsBlock({ data }: { data: Record<string, unknown> }) {
  const layout = (data.layout as string) ?? '50-50';
  const gap = (data.gap as number) ?? 10;
  const columns = (data.columns ?? []) as Array<{
    width: string;
    childrenIds: string[];
    padding: { top: number; bottom: number; left: number; right: number };
  }>;

  const blocks = useEmailBuilderStore((s) => s.template.blocks);
  const addBlockToColumn = useEmailBuilderStore((s) => s.addBlockToColumn);

  const layoutWidths: Record<string, string[]> = {
    '50-50': ['50%', '50%'],
    '33-33-33': ['33.33%', '33.33%', '33.33%'],
    '66-33': ['66.66%', '33.33%'],
    '33-66': ['33.33%', '66.66%'],
  };

  const widths = layoutWidths[layout] ?? layoutWidths['50-50'];

  // We need to get the columnBlockId. We look it up from the blocks map.
  // The data object doesn't hold the block ID, so we find it by reference.
  const columnBlockId = Object.keys(blocks).find((id) => blocks[id].data === data) ?? '';

  const handleAddBlock = (columnIndex: number) => {
    if (columnBlockId) {
      addBlockToColumn(columnBlockId, columnIndex, 'text');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap,
        padding: '10px 20px',
      }}
    >
      {widths.map((width, index) => {
        const column = columns[index];
        const childrenIds = column?.childrenIds ?? [];

        return (
          <div
            key={index}
            style={{
              width,
              minHeight: 80,
              border: '1px dashed #DDD',
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {childrenIds.length === 0 ? (
              <div
                className="flex-1 flex items-center justify-center text-gray-400 text-xs"
                style={{ padding: 8 }}
              >
                Arraste blocos aqui
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                {childrenIds.map((childId) => {
                  const childBlock = blocks[childId];
                  if (!childBlock) return null;
                  return (
                    <div key={childId}>
                      <BlockRenderer block={childBlock} />
                    </div>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddBlock(index);
              }}
              className="w-full py-1 text-xs text-gray-400 hover:text-[#F26B2A] hover:bg-orange-50 border-t border-dashed border-gray-200 transition-colors"
            >
              + Adicionar bloco
            </button>
          </div>
        );
      })}
    </div>
  );
}
