'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEmailBuilderStore, createEmptyTemplate } from '@/lib/email-builder/store';
import type { EmailTemplate } from '@/lib/email-builder/types';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { StylePanel } from './StylePanel';
import { Toolbar } from './Toolbar';
import { toast } from 'sonner';

interface EditorProps {
  initialTemplate?: EmailTemplate;
  onSave?: (template: EmailTemplate, html: string) => void;
}

export function Editor({ initialTemplate, onSave }: EditorProps) {
  const setTemplate = useEmailBuilderStore((s) => s.setTemplate);
  const previewMode = useEmailBuilderStore((s) => s.previewMode);
  const [autoSaveLabel, setAutoSaveLabel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    } else {
      setTemplate(createEmptyTemplate());
    }
  }, [initialTemplate, setTemplate]);

  const handleAutoSave = useCallback(async () => {
    const state = useEmailBuilderStore.getState();
    if (!state.isDirty || !onSave) return;

    try {
      const res = await fetch('/api/email-builder/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: state.template }),
      });
      const data = (await res.json()) as { html: string };
      onSave(state.template, data.html);
      useEmailBuilderStore.getState().setDirty(false);
      setAutoSaveLabel('Salvo automaticamente');
      setTimeout(() => setAutoSaveLabel(''), 3000);
    } catch {
      toast.error('Erro ao salvar automaticamente.');
    }
  }, [onSave]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      void handleAutoSave();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [handleAutoSave]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar onSave={onSave} />
      {autoSaveLabel && (
        <div className="flex justify-center">
          <span className="text-xs text-gray-400 py-1">{autoSaveLabel}</span>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {previewMode === 'edit' && (
          <div className="w-[260px] border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <Canvas />
        </div>
        {previewMode === 'edit' && (
          <div className="w-[300px] border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
            <StylePanel />
          </div>
        )}
      </div>
    </div>
  );
}
