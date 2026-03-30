'use client';

import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import type { BlockType } from '@/lib/email-builder/types';
import { BlockWrapper } from './BlockWrapper';
import { BlockRenderer } from './blocks/BlockRenderer';

export function Canvas() {
  const template = useEmailBuilderStore((s) => s.template);
  const previewMode = useEmailBuilderStore((s) => s.previewMode);
  const addBlock = useEmailBuilderStore((s) => s.addBlock);
  const selectBlock = useEmailBuilderStore((s) => s.selectBlock);

  const { childrenIds } = template.root.data;
  const { blocks } = template;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((_event: DragStartEvent) => {
    useEmailBuilderStore.getState().setDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    useEmailBuilderStore.getState().setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const state = useEmailBuilderStore.getState();
    const oldIndex = state.template.root.data.childrenIds.indexOf(String(active.id));
    const newIndex = state.template.root.data.childrenIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const newOrder = arrayMove(state.template.root.data.childrenIds, oldIndex, newIndex);
    // Use moveBlock to the new index
    state.moveBlock(String(active.id), newOrder.indexOf(String(active.id)));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData('block-type') as BlockType;
      if (blockType) {
        addBlock(blockType);
      }
    },
    [addBlock]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const canvasWidth = previewMode === 'mobile' ? 375 : template.root.data.width;
  const isDarkPreview = previewMode === 'dark';

  return (
    <div
      className="min-h-full p-8 flex justify-center"
      style={{ backgroundColor: isDarkPreview ? '#1a1a1a' : template.root.data.backdropColor }}
      onClick={(e) => {
        if (e.target === e.currentTarget) selectBlock(null);
      }}
    >
      <div
        className="shadow-lg"
        style={{
          width: canvasWidth,
          backgroundColor: template.root.data.canvasColor,
          minHeight: 200,
          ...(isDarkPreview ? { filter: 'invert(1) hue-rotate(180deg)' } : {}),
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {childrenIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">Arraste blocos da barra lateral para comecar</p>
            <p className="text-sm">ou clique em um bloco para adicionar</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
              {childrenIds.map((blockId) => {
                const block = blocks[blockId];
                if (!block) return null;
                return (
                  <BlockWrapper key={blockId} blockId={blockId}>
                    <BlockRenderer block={block} />
                  </BlockWrapper>
                );
              })}
            </SortableContext>
            <DragOverlay />
          </DndContext>
        )}
      </div>
    </div>
  );
}
