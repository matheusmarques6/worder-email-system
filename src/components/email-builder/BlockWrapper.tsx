'use client';

import { type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';

interface BlockWrapperProps {
  blockId: string;
  children: ReactNode;
}

export function BlockWrapper({ blockId, children }: BlockWrapperProps) {
  const selectedBlockId = useEmailBuilderStore((s) => s.selectedBlockId);
  const hoveredBlockId = useEmailBuilderStore((s) => s.hoveredBlockId);
  const selectBlock = useEmailBuilderStore((s) => s.selectBlock);
  const hoverBlock = useEmailBuilderStore((s) => s.hoverBlock);
  const removeBlock = useEmailBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useEmailBuilderStore((s) => s.duplicateBlock);
  const moveBlock = useEmailBuilderStore((s) => s.moveBlock);
  const childrenIds = useEmailBuilderStore((s) => s.template.root.data.childrenIds);

  const isSelected = selectedBlockId === blockId;
  const isHovered = hoveredBlockId === blockId;

  const blockIndex = childrenIds.indexOf(blockId);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < childrenIds.length - 1;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blockId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer ${
        isSelected
          ? 'ring-2 ring-[#F26B2A]'
          : isHovered
          ? 'ring-2 ring-blue-400'
          : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(blockId);
      }}
      onMouseEnter={() => hoverBlock(blockId)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {children}

      {isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-0.5 bg-white border border-gray-200 rounded-md shadow-sm z-10">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 hover:bg-gray-100 rounded-l-md cursor-grab"
            title="Arrastar"
          >
            <GripVertical size={14} className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (canMoveUp) moveBlock(blockId, blockIndex - 1);
            }}
            disabled={!canMoveUp}
            className="p-1.5 hover:bg-gray-100 disabled:opacity-30"
            title="Mover para cima"
          >
            <ArrowUp size={14} className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (canMoveDown) moveBlock(blockId, blockIndex + 1);
            }}
            disabled={!canMoveDown}
            className="p-1.5 hover:bg-gray-100 disabled:opacity-30"
            title="Mover para baixo"
          >
            <ArrowDown size={14} className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(blockId);
            }}
            className="p-1.5 hover:bg-gray-100"
            title="Duplicar"
          >
            <Copy size={14} className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(blockId);
            }}
            className="p-1.5 hover:bg-red-50 rounded-r-md"
            title="Excluir"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
