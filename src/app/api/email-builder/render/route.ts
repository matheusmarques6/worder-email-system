import { NextResponse } from 'next/server';
import { renderEmailToHtml } from '@/lib/email-builder/renderer';
import type { EmailTemplate } from '@/lib/email-builder/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { template: EmailTemplate };
    const { template } = body;

    if (!template || !template.root || !template.blocks) {
      return NextResponse.json(
        { error: 'Template invalido' },
        { status: 400 }
      );
    }

    const html = renderEmailToHtml(template);
    const sizeKb = Math.round((new TextEncoder().encode(html).length / 1024) * 100) / 100;

    return NextResponse.json({ html, sizeKb });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao renderizar template' },
      { status: 500 }
    );
  }
}
