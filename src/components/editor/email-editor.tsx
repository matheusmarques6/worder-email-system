"use client"

import { useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import type { EditorRef } from "react-email-editor"
import { mergeTags } from "./merge-tags"

const EmailEditor = dynamic(() => import("react-email-editor").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 border border-gray-200 rounded-lg">
      <div className="animate-pulse text-gray-400">Carregando editor...</div>
    </div>
  ),
})

interface EmailEditorWrapperProps {
  initialDesign?: Record<string, unknown>
  onSave?: (html: string, designJson: Record<string, unknown>) => void
  editorRef?: React.RefObject<EditorRef | null>
}

export default function EmailEditorWrapper({
  initialDesign,
  onSave,
  editorRef: externalRef,
}: EmailEditorWrapperProps) {
  const internalRef = useRef<EditorRef | null>(null)
  const ref = externalRef ?? internalRef

  const onReady = useCallback(() => {
    if (initialDesign && ref.current?.editor) {
      ref.current.editor.loadDesign(initialDesign)
    }
  }, [initialDesign, ref])

  const handleExportHtml = useCallback(() => {
    if (ref.current?.editor) {
      ref.current.editor.exportHtml((data: { html: string; design: Record<string, unknown> }) => {
        onSave?.(data.html, data.design)
      })
    }
  }, [ref, onSave])

  // Build merge tags for Unlayer
  const unlayerMergeTags: Record<string, { name: string; value: string; mergeTags?: Record<string, { name: string; value: string }> }> = {}
  mergeTags.forEach((category) => {
    const categoryTags: Record<string, { name: string; value: string }> = {}
    category.tags.forEach((tag) => {
      categoryTags[tag.value] = { name: tag.name, value: tag.value }
    })
    unlayerMergeTags[category.name] = {
      name: category.name,
      value: "",
      mergeTags: categoryTags,
    }
  })

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "600px" }}>
        <EmailEditor
          ref={ref}
          onReady={onReady}
          minHeight="600px"
          options={{
            mergeTags: unlayerMergeTags,
            features: { textEditor: { tables: true } },
            appearance: {
              theme: "light",
              panels: { tools: { dock: "left" } },
            },
          }}
        />
      </div>
      {onSave && (
        <button
          onClick={handleExportHtml}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Salvar Template
        </button>
      )}
    </div>
  )
}
