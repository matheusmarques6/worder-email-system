'use client';

import { useState } from 'react';
import { Undo2, Redo2, Monitor, Smartphone, Pencil, Save, Send, Moon, Palette } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import type { EmailTemplate } from '@/lib/email-builder/types';
import { SendTestModal } from './modals/SendTestModal';
import { BrandKitModal } from './modals/BrandKitModal';

interface ToolbarProps {
  onSave?: (template: EmailTemplate, html: string) => void;
  storeId?: string;
}

export function Toolbar({ onSave, storeId }: ToolbarProps) {
  const template = useEmailBuilderStore((s) => s.template);
  const previewMode = useEmailBuilderStore((s) => s.previewMode);
  const setPreviewMode = useEmailBuilderStore((s) => s.setPreviewMode);
  const undo = useEmailBuilderStore((s) => s.undo);
  const redo = useEmailBuilderStore((s) => s.redo);
  const historyIndex = useEmailBuilderStore((s) => s.historyIndex);
  const historyLength = useEmailBuilderStore((s) => s.history.length);
  const isDirty = useEmailBuilderStore((s) => s.isDirty);

  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [brandKitOpen, setBrandKitOpen] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  async function handleSave() {
    if (!onSave) return;
    try {
      const res = await fetch('/api/email-builder/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      });
      const data = (await res.json()) as { html: string };
      onSave(template, data.html);
    } catch {
      onSave(template, '');
    }
  }

  async function handleOpenSendTest() {
    try {
      const res = await fetch('/api/email-builder/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      });
      const data = (await res.json()) as { html: string };
      setRenderedHtml(data.html);
      setSendTestOpen(true);
    } catch {
      setRenderedHtml('');
      setSendTestOpen(true);
    }
  }

  const modeButtons: { mode: 'edit' | 'desktop' | 'mobile' | 'dark'; icon: typeof Pencil; label: string }[] = [
    { mode: 'edit', icon: Pencil, label: 'Editar' },
    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
    { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
    { mode: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Desfazer"
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Refazer"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {modeButtons.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                previewMode === mode
                  ? 'bg-white text-[#F26B2A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBrandKitOpen(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Palette size={16} />
            Brand Kit
          </button>
          <button
            type="button"
            onClick={handleOpenSendTest}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Send size={16} />
            Enviar Teste
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || !onSave}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#F26B2A] rounded-lg hover:bg-[#d95d22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>

      <SendTestModal
        open={sendTestOpen}
        onClose={() => setSendTestOpen(false)}
        html={renderedHtml}
        subject={template.root.data.subject || 'Teste de Email'}
      />

      <BrandKitModal
        open={brandKitOpen}
        onClose={() => setBrandKitOpen(false)}
        storeId={storeId}
      />
    </>
  );
}
