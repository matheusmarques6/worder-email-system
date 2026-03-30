'use client';

import { type ReactNode, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical, Eye, Bookmark } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { ConditionBuilderModal } from './modals/ConditionBuilderModal';
import { SaveBlockModal } from './modals/SaveBlockModal';
import type { DisplayCondition } from '@/lib/email-builder/types';

interface BlockWrapperProps {
  blockId: string;
  children: ReactNode;
  storeId?: string;
}

export function BlockWrapper({ blockId, children, storeId }: BlockWrapperProps) {
  const selectedBlockId = useEmailBuilderStore((s) => s.selectedBlockId);
  const hoveredBlockId = useEmailBuilderStore((s) => s.hoveredBlockId);
  const selectBlock = useEmailBuilderStore((s) => s.selectBlock);
  const hoverBlock = useEmailBuilderStore((s) => s.hoverBlock);
  const removeBlock = useEmailBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useEmailBuilderStore((s) => s.duplicateBlock);
  const moveBlock = useEmailBuilderStore((s) => s.moveBlock);
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const childrenIds = useEmailBuilderStore((s) => s.template.root.data.childrenIds);
  const block = useEmailBuilderStore((s) => s.template.blocks[blockId]);

  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const isSelected = selectedBlockId === blockId;
  const isHovered = hoveredBlockId === blockId;

  const blockIndex = childrenIds.indexOf(blockId);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < childrenIds.length - 1;

  const hasConditions =
    block?.displayConditions &&
    block.displayConditions.conditions.length > 0;

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

  function handleSaveConditions(conditions: DisplayCondition[], logic: 'and' | 'or') {
    updateBlock(blockId, {
      ...block?.data,
      __displayConditions: conditions.length > 0 ? { conditions, logic } : undefined,
    });

    // Also update blockBase-level displayConditions
    const currentBlocks = useEmailBuilderStore.getState().template.blocks;
    const currentBlock = currentBlocks[blockId];
    if (currentBlock) {
      const updatedBlock = {
        ...currentBlock,
        displayConditions: conditions.length > 0 ? { conditions, logic } : undefined,
      };
      const newBlocks = { ...currentBlocks, [blockId]: updatedBlock };
      const template = useEmailBuilderStore.getState().template;
      useEmailBuilderStore.getState().setTemplate({
        ...template,
        blocks: newBlocks,
      });
    }
  }

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
      {hasConditions && (
        <div className="absolute top-1 left-1 z-10">
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
            <Eye size={10} />
            Condicional
          </div>
        </div>
      )}

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
              setConditionModalOpen(true);
            }}
            className={`p-1.5 hover:bg-gray-100 ${hasConditions ? 'text-amber-500' : 'text-gray-500'}`}
            title="Condições de exibição"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSaveModalOpen(true);
            }}
            className="p-1.5 hover:bg-gray-100"
            title="Salvar como reutilizável"
          >
            <Bookmark size={14} className="text-gray-500" />
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

      <ConditionBuilderModal
        open={conditionModalOpen}
        onClose={() => setConditionModalOpen(false)}
        conditions={block?.displayConditions?.conditions ?? []}
        logic={block?.displayConditions?.logic ?? 'and'}
        onSave={handleSaveConditions}
      />

      <SaveBlockModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        block={block ?? null}
        storeId={storeId}
      />
    </div>
  );
}
