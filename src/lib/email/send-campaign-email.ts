import { createAdminClient } from "@/lib/supabase/admin";
import { prepareEmailHtml, prepareSubject } from "./render";
import { sendEmail } from "./resend";
import type { Contact, Store, Template } from "@/types";

interface SendCampaignEmailResult {
  success: boolean;
  emailSendId?: string;
  error?: string;
}

export async function sendCampaignEmail(
  contact: Contact,
  template: Template,
  store: Store,
  campaignId?: string,
  flowId?: string,
  flowExecutionId?: string,
  eventData?: Record<string, string>
): Promise<SendCampaignEmailResult> {
  const supabase = createAdminClient();

  // 1. Create email_send row with queued status
  const { data: emailSend, error: insertError } = await supabase
    .from("email_sends")
    .insert({
      store_id: store.id,
      contact_id: contact.id,
      campaign_id: campaignId || null,
      flow_id: flowId || null,
      flow_execution_id: flowExecutionId || null,
      template_id: template.id,
      subject: template.subject || "",
      status: "queued",
    })
    .select()
    .single();

  if (insertError || !emailSend) {
    return {
      success: false,
      error: insertError?.message || "Failed to create email_send",
    };
  }

  // 2. Build merge data
  const mergeData: Record<string, string> = {
    email: contact.email,
    first_name: contact.first_name || "",
    last_name: contact.last_name || "",
    phone: contact.phone || "",
    store_name: store.name,
    store_url: store.shopify_domain
      ? `https://${store.shopify_domain}`
      : "",
    ...eventData,
  };

  // 3. Prepare HTML with tracking
  const html = prepareEmailHtml(
    template.html || "",
    {
      contact: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
      },
      store: {
        name: store.name,
        url: store.shopify_domain || "",
      },
    },
    emailSend.id
  );

  // 4. Render subject with merge tags
  const subject = prepareSubject(
    template.subject || store.name,
    {
      contact: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
      },
      store: {
        name: store.name,
      },
    }
  );

  // 5. Send via Resend
  const result = await sendEmail({
    to: contact.email,
    from: `noreply@${store.shopify_domain || "mail.convertfy.com.br"}`,
    senderName: store.name,
    subject,
    html,
    tags: {
      store_id: store.id,
      ...(campaignId ? { campaign_id: campaignId } : {}),
      ...(flowId ? { flow_id: flowId } : {}),
    },
  });

  // 6. Update email_send status
  if (result.error) {
    await supabase
      .from("email_sends")
      .update({ status: "failed" })
      .eq("id", emailSend.id);

    return { success: false, emailSendId: emailSend.id, error: result.error };
  }

  await supabase
    .from("email_sends")
    .update({
      resend_message_id: result.id,
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", emailSend.id);

  return { success: true, emailSendId: emailSend.id };
}
