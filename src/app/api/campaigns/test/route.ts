import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, html } = await request.json();

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, html" },
      { status: 400 }
    );
  }

  // Get store for sender info
  const { data: store } = await supabase
    .from("stores")
    .select("name, shopify_domain")
    .eq("user_id", user.id)
    .single();

  const senderName = store?.name || "Convertfy Mail";
  const fromDomain = store?.shopify_domain || "mail.convertfy.com.br";

  const result = await sendEmail({
    to,
    from: `noreply@${fromDomain}`,
    senderName,
    subject,
    html,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: result.id });
}
