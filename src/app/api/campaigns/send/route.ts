import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCampaignEmail } from "@/lib/email/send-campaign-email";
import { resolveSegment } from "@/lib/segments/resolver";
import type { Contact, Store, Template } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { campaignId } = body;

  const supabase = createAdminClient();

  // Get campaign
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Get template
  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", campaign.template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Get store
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", campaign.store_id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Resolve contacts
  let contactIds: string[] = [];

  if (campaign.list_id) {
    const { data: members } = await supabase
      .from("list_members")
      .select("contact_id")
      .eq("list_id", campaign.list_id);
    contactIds = (members || []).map((m) => m.contact_id);
  } else if (campaign.segment_id) {
    contactIds = await resolveSegment(campaign.segment_id, campaign.store_id);
  }

  if (contactIds.length === 0) {
    return NextResponse.json({ error: "No contacts found" }, { status: 400 });
  }

  // Get subscribed contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .in("id", contactIds)
    .eq("consent_email", "subscribed");

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: "No subscribed contacts" }, { status: 400 });
  }

  // Update campaign status
  await supabase
    .from("campaigns")
    .update({ status: "sending", sent_at: new Date().toISOString() })
    .eq("id", campaignId);

  // Send emails
  let totalSent = 0;
  for (const contact of contacts) {
    const result = await sendCampaignEmail(
      contact as Contact,
      template as Template,
      store as Store,
      campaignId,
    );

    if (result.success) totalSent++;
  }

  // Update campaign
  await supabase
    .from("campaigns")
    .update({ status: "sent", total_sent: totalSent })
    .eq("id", campaignId);

  return NextResponse.json({ sent: totalSent });
}
