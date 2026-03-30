import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderEmailToHtml } from '@/lib/email-builder/renderer';
import type { EmailTemplate } from '@/lib/email-builder/types';

interface SaveRequestBody {
  templateId?: string;
  template: EmailTemplate;
  storeId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveRequestBody;
    const { templateId, template, storeId } = body;

    if (!template || !template.root || !template.blocks) {
      return NextResponse.json(
        { error: 'Template invalido' },
        { status: 400 }
      );
    }

    const html = renderEmailToHtml(template);
    const supabase = await createClient();

    if (templateId) {
      // Atualizar template existente
      const { error } = await supabase
        .from('templates')
        .update({
          design_json: template,
          html,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId);

      if (error) {
        return NextResponse.json(
          { error: 'Erro ao atualizar template' },
          { status: 500 }
        );
      }

      return NextResponse.json({ id: templateId, html });
    } else {
      // Criar novo template
      const { data, error } = await supabase
        .from('templates')
        .insert({
          design_json: template,
          html,
          store_id: storeId ?? null,
          name: template.root.data.subject || 'Sem titulo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Erro ao criar template' },
          { status: 500 }
        );
      }

      return NextResponse.json({ id: data.id, html });
    }
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
