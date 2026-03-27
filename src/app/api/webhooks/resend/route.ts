import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ResendWebhookPayload {
  type: string;
  data: {
    email_id: string;
    to: string[];
    created_at: string;
  };
}

export async function POST(request: NextRequest) {
  // Verify webhook signature via shared secret header
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 401 });
    }
  }

  let payload: ResendWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { type, data } = payload;

  if (!data?.email_id) {
    return NextResponse.json({ received: true });
  }

  const resendMessageId = data.email_id;

  // Find the email_send by resend_message_id
  const { data: emailSend } = await supabase
    .from("email_sends")
    .select("id, contact_id, store_id")
    .eq("resend_message_id", resendMessageId)
    .single();

  if (!emailSend) {
    return NextResponse.json({ received: true });
  }

  switch (type) {
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

  return NextResponse.json({ received: true });
}
