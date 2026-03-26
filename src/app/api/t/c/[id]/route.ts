import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: emailSend } = await supabase
    .from("email_sends")
    .select("id, contact_id, store_id, clicked_at")
    .eq("id", id)
    .single();

  if (emailSend && !emailSend.clicked_at) {
    await supabase
      .from("email_sends")
      .update({ clicked_at: new Date().toISOString() })
      .eq("id", id);

    await supabase.from("events").insert({
      store_id: emailSend.store_id,
      contact_id: emailSend.contact_id,
      type: "email_clicked",
      data: { email_send_id: id, url: decodeURIComponent(url) },
    });
  }

  return NextResponse.redirect(decodeURIComponent(url), 302);
}
