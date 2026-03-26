"use client";

import { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import EmailEditor, {
  type EditorRef,
  type EmailEditorProps,
  type Editor,
} from "react-email-editor";
import { mergeTags } from "./merge-tags";

interface EmailEditorWrapperProps {
  designJson?: Record<string, unknown>;
  onSave?: (html: string, json: Record<string, unknown>) => void;
  height?: string;
}

export interface EmailEditorHandle {
  exportHtml: () => void;
}

export const EmailEditorWrapper = forwardRef<
  EmailEditorHandle,
  EmailEditorWrapperProps
>(function EmailEditorWrapper({ designJson, onSave, height = "100vh" }, ref) {
  const emailEditorRef = useRef<EditorRef | null>(null);

  const onReady = useCallback(
    (unlayer: Editor) => {
      if (emailEditorRef.current) {
        emailEditorRef.current.editor = unlayer;
      }
      if (designJson) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unlayer.loadDesign(designJson as any);
      }
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
