"use client";

import { useRef, useCallback, useImperativeHandle, useEffect, useState, forwardRef } from "react";
import EmailEditor, {
  type EditorRef,
  type EmailEditorProps,
  type Editor,
} from "react-email-editor";
import { toast } from "sonner";
import { mergeTags } from "./merge-tags";

interface EmailEditorWrapperProps {
  designJson?: Record<string, unknown>;
  onSave?: (html: string, json: Record<string, unknown>) => void;
  height?: string;
}

export interface EmailEditorHandle {
  exportHtml: () => void;
  getHtml: (callback: (html: string) => void) => void;
}

export const EmailEditorWrapper = forwardRef<
  EmailEditorHandle,
  EmailEditorWrapperProps
>(function EmailEditorWrapper({ designJson, onSave, height = "100vh" }, ref) {
  const emailEditorRef = useRef<EditorRef | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!editorReady) return;

    const interval = setInterval(() => {
      emailEditorRef.current?.editor?.exportHtml(
        (data: { design: Record<string, unknown>; html: string }) => {
          onSaveRef.current?.(data.html, data.design);
          toast.success("Salvo automaticamente");
        }
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [editorReady]);

  const onReady = useCallback(
    (unlayer: Editor) => {
      if (emailEditorRef.current) {
        emailEditorRef.current.editor = unlayer;
      }
      if (designJson) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unlayer.loadDesign(designJson as any);
      }
      setEditorReady(true);
    },
    [designJson]
  );

  useImperativeHandle(
    ref,
    () => ({
      exportHtml: () => {
        emailEditorRef.current?.editor?.exportHtml(
          (data: { design: Record<string, unknown>; html: string }) => {
            onSave?.(data.html, data.design);
          }
        );
      },
      getHtml: (callback: (html: string) => void) => {
        emailEditorRef.current?.editor?.exportHtml(
          (data: { html: string }) => {
            callback(data.html);
          }
        );
      },
    }),
    [onSave]
  );

  return (
    <div style={{ height }}>
      <EmailEditor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={emailEditorRef as any}
        onReady={onReady as unknown as EmailEditorProps["onReady"]}
        options={{
          mergeTags,
          locale: "pt-BR",
          appearance: {
            theme: "modern_light",
          },
          features: {
            textEditor: {
              tables: true,
            },
          },
        }}
        style={{ height: "100%" }}
      />
    </div>
  );
});
