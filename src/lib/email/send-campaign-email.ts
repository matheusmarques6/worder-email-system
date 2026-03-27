import { createAdminClient } from "@/lib/supabase/admin"
import { prepareEmailHtml } from "./render"
import { sendEmail } from "./resend"

export async function sendCampaignEmail(
  contact: { id: string; email: string; first_name?: string | null; last_name?: string | null; phone?: string | null },
  template: { id: string; html: string | null; subject: string | null },
  store: { id: string; name: string; shopify_domain?: string | null },
  campaignId?: string,
  flowId?: string
): Promise<{ success: boolean; emailSendId?: string; error?: string }> {
  const supabase = createAdminClient()

  const { data: emailSend, error: insertError } = await supabase.from("email_sends").insert({
    store_id: store.id, contact_id: contact.id, campaign_id: campaignId || null,
    flow_id: flowId || null, template_id: template.id, subject: template.subject || "",
    status: "queued",
  }).select().single()

  if (insertError || !emailSend) return { success: false, error: insertError?.message || "Failed to create email_send" }

  const mergeData = {
    contact: { first_name: contact.first_name, last_name: contact.last_name, email: contact.email, phone: contact.phone },
    store: { name: store.name, url: store.shopify_domain ? `https://${store.shopify_domain}` : "" },
  }

  const html = prepareEmailHtml(template.html || "", mergeData, emailSend.id)

  let subject = template.subject || store.name
  subject = subject.replace(/\{\{first_name\}\}/g, contact.first_name || "")
  subject = subject.replace(/\{\{store_name\}\}/g, store.name)

  const result = await sendEmail({
    to: contact.email,
    from: `noreply@${store.shopify_domain || "mail.convertfy.com.br"}`,
    senderName: store.name, subject, html,
    tags: { store_id: store.id, ...(campaignId ? { campaign_id: campaignId } : {}), ...(flowId ? { flow_id: flowId } : {}) },
  })

  if (result.error) {
    await supabase.from("email_sends").update({ status: "failed" }).eq("id", emailSend.id)
    return { success: false, emailSendId: emailSend.id, error: result.error }
  }

  await supabase.from("email_sends").update({ resend_message_id: result.id, status: "sent", sent_at: new Date().toISOString() }).eq("id", emailSend.id)
  return { success: true, emailSendId: emailSend.id }
}
