import { createAdminClient } from "@/lib/supabase/admin";

interface SessionData {
  page_url?: string;
  user_agent?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  click_ids?: {
    fbclid?: string;
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    ttclid?: string;
    fbc?: string;
    fbp?: string;
  };
}

export async function createOrUpdateSession(
  storeId: string,
  visitorId: string,
  sessionId: string,
  data: SessionData
): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("store_id", storeId)
    .eq("event_type", "session_start")
    .eq("properties->>session_id", sessionId)
    .single();

  const eventData = {
    store_id: storeId,
    event_type: "session_start",
    properties: {
      visitor_id: visitorId,
      session_id: sessionId,
      page_url: data.page_url,
      user_agent: data.user_agent,
      utm: data.utm,
      click_ids: data.click_ids,
    },
  };

  if (existing) {
    await supabase.from("events").update(eventData).eq("id", existing.id);
  } else {
    await supabase.from("events").insert(eventData);
  }
}
