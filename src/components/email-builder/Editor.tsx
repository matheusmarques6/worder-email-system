'use client';

import { useEffect } from 'react';
import { useEmailBuilderStore, createEmptyTemplate } from '@/lib/email-builder/store';
import type { EmailTemplate } from '@/lib/email-builder/types';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { StylePanel } from './StylePanel';
import { Toolbar } from './Toolbar';

interface EditorProps {
  initialTemplate?: EmailTemplate;
  onSave?: (template: EmailTemplate, html: string) => void;
}

export function Editor({ initialTemplate, onSave }: EditorProps) {
  const setTemplate = useEmailBuilderStore((s) => s.setTemplate);
  const previewMode = useEmailBuilderStore((s) => s.previewMode);

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    } else {
      setTemplate(createEmptyTemplate());
    }
  }, [initialTemplate, setTemplate]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar onSave={onSave} />
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
