'use client';

import { Undo2, Redo2, Monitor, Smartphone, Pencil, Save, Send } from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import type { EmailTemplate } from '@/lib/email-builder/types';

interface ToolbarProps {
  onSave?: (template: EmailTemplate, html: string) => void;
}

export function Toolbar({ onSave }: ToolbarProps) {
  const template = useEmailBuilderStore((s) => s.template);
  const previewMode = useEmailBuilderStore((s) => s.previewMode);
  const setPreviewMode = useEmailBuilderStore((s) => s.setPreviewMode);
  const undo = useEmailBuilderStore((s) => s.undo);
  const redo = useEmailBuilderStore((s) => s.redo);
  const historyIndex = useEmailBuilderStore((s) => s.historyIndex);
  const historyLength = useEmailBuilderStore((s) => s.history.length);
  const isDirty = useEmailBuilderStore((s) => s.isDirty);

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
      const { html } = (await res.json()) as { html: string };
      onSave(template, html);
    } catch {
      onSave(template, '');
    }
  }

  async function handleSendTest() {
    const email = window.prompt('Digite o e-mail para envio de teste:');
    if (!email) return;
    try {
      const res = await fetch('/api/email-builder/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      });
      const { html } = (await res.json()) as { html: string };
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: template.root.data.subject || 'Teste de Email',
          html,
        }),
      });
      window.alert('E-mail de teste enviado!');
    } catch {
      window.alert('Erro ao enviar e-mail de teste.');
    }
  }

  const modeButtons: { mode: 'edit' | 'desktop' | 'mobile'; icon: typeof Pencil; label: string }[] = [
    { mode: 'edit', icon: Pencil, label: 'Editar' },
    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
    { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  return (
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
          onClick={handleSendTest}
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
  );
}
