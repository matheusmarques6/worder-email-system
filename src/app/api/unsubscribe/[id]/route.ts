import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = supabaseAdmin()

  try {
    // Get the email send to find the contact
    const { data: emailSend } = await db
      .from("email_sends")
      .select("contact_id")
      .eq("id", id)
      .single()

    if (emailSend?.contact_id) {
      await db
        .from("contacts")
        .update({ subscribed: false, updated_at: new Date().toISOString() })
        .eq("id", emailSend.contact_id)

      await db
        .from("email_sends")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", id)
    }
  } catch (error) {
    console.error("Unsubscribe error:", error)
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Descadastrado</title>
<style>body{font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;}
.card{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:48px;text-align:center;max-width:400px;box-shadow:0 1px 2px rgba(0,0,0,0.05);}
h1{font-size:24px;font-weight:600;color:#111827;margin-bottom:8px;}
p{font-size:14px;color:#6b7280;}</style></head>
<body><div class="card"><h1>Descadastrado com sucesso</h1><p>Você não receberá mais emails desta lista.</p></div></body></html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
