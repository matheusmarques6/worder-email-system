import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  // Webhook verification
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WA_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const supabase = createAdminClient();

  const entries = payload.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];

    for (const change of changes) {
      if (change.field !== "messages") continue;

      const statuses = change.value?.statuses || [];

      for (const status of statuses) {
        const waMessageId = status.id;
        const statusType = status.status; // sent, delivered, read, failed

        const updateData: Record<string, string> = {};

        switch (statusType) {
          case "sent":
            updateData.status = "sent";
            break;
          case "delivered":
            updateData.status = "delivered";
            updateData.delivered_at = new Date().toISOString();
            break;
          case "read":
            updateData.status = "read";
            updateData.read_at = new Date().toISOString();
            break;
          case "failed":
            updateData.status = "failed";
            break;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from("whatsapp_sends")
            .update(updateData)
            .eq("wa_message_id", waMessageId);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
