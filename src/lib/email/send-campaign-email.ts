import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./resend";
import { prepareEmailHtml } from "./render";
import type { Contact, Store, Template } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface SendCampaignEmailParams {
  contact: Contact;
  store: Store;
  template: Template;
  campaignId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
}

export async function sendCampaignEmail(
  params: SendCampaignEmailParams
): Promise<{ success: boolean; error?: string }> {
  const {
    contact,
    store,
    template,
    campaignId,
    subject,
    senderName,
    senderEmail,
  } = params;

  if (!template.html) {
    return { success: false, error: "Template has no HTML content" };
  }

  const supabase = createAdminClient();
  const emailSendId = uuidv4();

  // Prepare email HTML with merge tags, tracking, and unsubscribe
  const html = prepareEmailHtml(template.html, contact, store, emailSendId);

  // Render subject line merge tags
  const renderedSubject = subject
    .replace(/\{\{first_name\}\}/g, contact.first_name || "")
    .replace(/\{\{last_name\}\}/g, contact.last_name || "")
    .replace(/\{\{store_name\}\}/g, store.name);

  // Send via Resend
  const result = await sendEmail({
    to: contact.email,
    from: senderEmail,
    senderName,
    subject: renderedSubject,
    html,
  });

  // Record in database
  await supabase.from("email_sends").insert({
    id: emailSendId,
    store_id: store.id,
    contact_id: contact.id,
    campaign_id: campaignId,
    template_id: template.id,
    resend_message_id: result.id || null,
    subject: renderedSubject,
    status: result.error ? "failed" : "sent",
    sent_at: new Date().toISOString(),
  });

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
