import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const pixel = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  try {
    const { data: emailSend } = await supabase
      .from("email_sends")
      .select("id, opened_at, contact_id, store_id")
      .eq("id", id)
      .single();

    if (emailSend && !emailSend.opened_at) {
      await supabase
        .from("email_sends")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", id);

      await supabase.from("events").insert({
        store_id: emailSend.store_id,
        contact_id: emailSend.contact_id,
        event_type: "email_opened",
        data: { email_send_id: id },
      });
    }
  } catch {
    // Silently fail - don't break the pixel
  }

  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
