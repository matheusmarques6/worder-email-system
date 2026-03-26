"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { EditorRef } from "react-email-editor";
import { mergeTags } from "./merge-tags";

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Carregando editor...</p>
    </div>
  ),
});

interface EmailEditorWrapperProps {
  designJson?: Record<string, unknown>;
  onSave?: (html: string, json: Record<string, unknown>) => void;
  onReady?: () => void;
}

export function EmailEditorWrapper({
  designJson,
  onSave,
  onReady,
}: EmailEditorWrapperProps) {
  const emailEditorRef = useRef<EditorRef>(null);

  const handleReady = useCallback(() => {
    const editor = emailEditorRef.current?.editor;
    if (editor && designJson) {
      editor.loadDesign(designJson as Record<string, unknown>);
    }
    onReady?.();
  }, [designJson, onReady]);

  const handleSave = useCallback(() => {
    const editor = emailEditorRef.current?.editor;
    if (!editor) return;
    editor.exportHtml((data: { html: string; design: Record<string, unknown> }) => {
      onSave?.(data.html, data.design);
    });
  }, [onSave]);

  const projectId = process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID
    ? parseInt(process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID)
    : undefined;

  return (
    <div className="flex flex-col">
      <EmailEditor
        ref={emailEditorRef}
        onReady={handleReady}
        options={{
          projectId,
          locale: "pt-BR",
          appearance: {
            theme: "modern_light",
          },
          mergeTags,
          features: {
            textEditor: {
              spellChecker: true,
            },
          },
        }}
        style={{ height: "calc(100vh - 120px)" }}
      />
      {onSave && (
        <div className="flex justify-end border-t border-gray-200 bg-white px-4 py-3">
          <button
            onClick={handleSave}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
