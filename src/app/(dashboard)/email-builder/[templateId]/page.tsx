'use client';

import { use, useEffect, useState } from 'react';
import { Editor } from '@/components/email-builder/Editor';
import { createClient } from '@/lib/supabase/client';
import type { EmailTemplate } from '@/lib/email-builder/types';

export default function EmailBuilderTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const [initialTemplate, setInitialTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      const supabase = createClient();
      const { data } = await supabase
        .from('templates')
        .select('design_json')
        .eq('id', templateId)
        .single();

      if (data?.design_json) {
        setInitialTemplate(data.design_json as unknown as EmailTemplate);
      }
      setLoading(false);
    }
    loadTemplate();
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Carregando editor de email...</p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Editor
        initialTemplate={initialTemplate ?? undefined}
        onSave={async (template, html) => {
          try {
            await fetch('/api/email-builder/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ templateId, template, html }),
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
