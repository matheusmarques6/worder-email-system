import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface TrackPayload {
  store_id: string;
  visitor_id?: string;
  session_id?: string;
  event_name: string;
  event_id?: string;
  page_url?: string;
  user_agent?: string;
  utm_params?: {
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
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
  };
  custom_data?: {
    content_type?: string;
    content_ids?: string[];
    value?: number;
    currency?: string;
    product_name?: string;
    product_id?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as TrackPayload;
    const supabase = createAdminClient();

    // Verify store exists
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("id", payload.store_id)
      .single();

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    let contactId: string | null = null;

    // Upsert contact if user_data has email
    if (payload.user_data?.email) {
      const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("store_id", payload.store_id)
        .eq("email", payload.user_data.email)
        .single();

      if (existing) {
        contactId = existing.id;
        await supabase
          .from("contacts")
          .update({
            phone: payload.user_data.phone || undefined,
            first_name: payload.user_data.first_name || undefined,
            last_name: payload.user_data.last_name || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contactId);
      } else {
        const { data: newContact } = await supabase
          .from("contacts")
          .insert({
            store_id: payload.store_id,
            email: payload.user_data.email,
            phone: payload.user_data.phone,
            first_name: payload.user_data.first_name,
            last_name: payload.user_data.last_name,
            source: "tracking",
          })
          .select("id")
          .single();
        contactId = newContact?.id || null;
      }
    }

    // Insert event
    await supabase.from("events").insert({
      store_id: payload.store_id,
      contact_id: contactId,
      event_type: payload.event_name,
      properties: {
        visitor_id: payload.visitor_id,
        session_id: payload.session_id,
        event_id: payload.event_id,
        page_url: payload.page_url,
        user_agent: payload.user_agent,
        utm: payload.utm_params,
        click_ids: payload.click_ids,
        custom_data: payload.custom_data,
      },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
