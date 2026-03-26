import { NextResponse, type NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { renderMergeTags } from "@/lib/email/render";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, subject, html, senderName, senderEmail } = body;

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Render with example merge tags
  const renderedHtml = renderMergeTags(html, {
    first_name: "João",
    last_name: "Silva",
    email: to,
    store_name: "Minha Loja",
    store_url: "https://minha-loja.com.br",
  });

  const result = await sendEmail({
    to,
    from: senderEmail || "test@convertfy.com",
    senderName: senderName || "Convertfy Mail",
    subject: `[TESTE] ${subject}`,
    html: renderedHtml,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ id: result.id });
}
