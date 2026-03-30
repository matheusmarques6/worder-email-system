import { NextResponse } from 'next/server';
import { renderEmailComplete } from '@/lib/email-builder/renderer';
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

    const { html, plainText, sizeKb, errors, warnings } = renderEmailComplete(template);

    return NextResponse.json({ html, plainText, sizeKb, errors, warnings });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao renderizar template' },
      { status: 500 }
    );
  }
}
