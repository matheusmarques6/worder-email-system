import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  try {
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

      await supabase.from("events").insert({
        store_id: emailSend.store_id,
        contact_id: emailSend.contact_id,
        event_type: "unsubscribed",
        data: { email_send_id: id },
      });
    }
  } catch {
    // Silently fail
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Descadastrado</title>
  <style>
    body { font-family: "DM Sans", system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #111827; font-size: 1.5rem; font-weight: 600; }
    p { color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Você foi descadastrado com sucesso</h1>
    <p>Você não receberá mais emails de marketing.</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
