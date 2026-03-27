import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

interface WhatsAppStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

interface WhatsAppWebhookEntry {
  changes: Array<{
    value: {
      statuses?: WhatsAppStatus[];
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      entry?: WhatsAppWebhookEntry[];
    };

    if (!body.entry) {
      return NextResponse.json({ ok: true });
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const statuses = change.value.statuses;
        if (!statuses) continue;

        for (const status of statuses) {
          const updateData: Record<string, string> = {};

          if (status.status === "delivered") {
            updateData.status = "delivered";
            updateData.delivered_at = new Date(
              Number(status.timestamp) * 1000
            ).toISOString();
          } else if (status.status === "read") {
            updateData.status = "read";
            updateData.read_at = new Date(
              Number(status.timestamp) * 1000
            ).toISOString();
          } else if (status.status === "failed") {
            updateData.status = "failed";
          }

          if (Object.keys(updateData).length > 0) {
            const db = supabaseAdmin;
            await db
              .from("whatsapp_sends")
              .update(updateData)
              .eq("wa_message_id", status.id);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
