import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ResendWebhookPayload {
  type: string;
  data: {
    email_id: string;
    to: string[];
  };
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as ResendWebhookPayload;
  const supabase = createAdminClient();

  const resendMessageId = payload.data.email_id;

  // Find the email_send by resend_message_id
  const { data: emailSend } = await supabase
    .from("email_sends")
    .select("id, contact_id")
    .eq("resend_message_id", resendMessageId)
    .single();

  if (!emailSend) {
    return NextResponse.json({ ok: true });
  }

  switch (payload.type) {
    case "email.delivered": {
      await supabase
        .from("email_sends")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", emailSend.id);
      break;
    }

    case "email.bounced": {
      await supabase
        .from("email_sends")
        .update({
          status: "bounced",
          bounced_at: new Date().toISOString(),
        })
        .eq("id", emailSend.id);

      // Mark contact as bounced
      await supabase
        .from("contacts")
        .update({ consent_email: "bounced" })
        .eq("id", emailSend.contact_id);
      break;
    }

    case "email.complained": {
      await supabase
        .from("contacts")
        .update({ consent_email: "unsubscribed" })
        .eq("id", emailSend.contact_id);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
