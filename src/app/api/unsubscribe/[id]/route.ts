import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: emailSend } = await supabase
    .from("email_sends")
    .select("contact_id, store_id")
    .eq("id", id)
    .single();

  if (emailSend) {
    await supabase
      .from("contacts")
      .update({ consent_email: "unsubscribed" })
      .eq("id", emailSend.contact_id);
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Descadastrado</title>
      <style>
        body { font-family: 'DM Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #F8F9FA; color: #111827; }
        .container { text-align: center; padding: 40px; max-width: 400px; }
        h1 { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
        p { font-size: 14px; color: #6B7280; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Descadastrado com sucesso</h1>
        <p>Você foi removido da nossa lista de emails. Não receberá mais mensagens.</p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
