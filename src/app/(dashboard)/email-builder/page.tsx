'use client';

import { Editor } from '@/components/email-builder/Editor';

export default function EmailBuilderPage() {
  return (
    <div className="h-screen">
      <Editor
        onSave={async (template, html) => {
          try {
            await fetch('/api/email-builder/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ template, html }),
            });
            window.alert('Template salvo com sucesso!');
          } catch {
            window.alert('Erro ao salvar o template.');
          }
        }}
      />
    </div>
  );
}
