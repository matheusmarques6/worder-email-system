'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Tag } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { MergeTagPickerModal } from '../modals/MergeTagPickerModal';

export function TextBlock({
  data,
  blockId,
  isSelected,
}: {
  data: Record<string, unknown>;
  blockId?: string;
  isSelected?: boolean;
}) {
  const html = (data.html as string) ?? '<p>Digite seu texto aqui...</p>';
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const [mergeTagOpen, setMergeTagOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Digite seu texto aqui...',
      }),
    ],
    content: html,
    editable: true,
    onUpdate: ({ editor: ed }) => {
      if (blockId) {
        updateBlock(blockId, { html: ed.getHTML() });
      }
    },
  });

  // Sync external HTML changes (e.g. from undo/redo) into the editor
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const current = editor.getHTML();
      if (current !== html) {
        editor.commands.setContent(html, { emitUpdate: false });
      }
    }
  }, [html, editor]);

  const containerStyle: React.CSSProperties = {
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
  };

  function handleMergeTagSelect(tagValue: string) {
    if (editor) {
      editor.commands.insertContent(tagValue);
    }
  }

  if (isSelected && editor) {
    return (
      <div style={containerStyle} className="tiptap-editor">
        <div className="flex items-center gap-1 mb-1">
          <button
            type="button"
            onClick={() => setMergeTagOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 hover:border-[#F26B2A] hover:text-[#F26B2A] transition-colors bg-white text-gray-600"
            title="Inserir merge tag"
          >
            <Tag size={12} />
            Merge Tag
          </button>
        </div>
        <EditorContent editor={editor} />
        <MergeTagPickerModal
          open={mergeTagOpen}
          onClose={() => setMergeTagOpen(false)}
          onSelect={handleMergeTagSelect}
        />
      </div>
    );
  }

  return (
    <div
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
