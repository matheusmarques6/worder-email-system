'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEmailBuilderStore } from '@/lib/email-builder/store';

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

  if (isSelected && editor) {
    return (
      <div style={containerStyle} className="tiptap-editor">
        <EditorContent editor={editor} />
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
