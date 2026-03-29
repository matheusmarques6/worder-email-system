import { createAdminClient } from "@/lib/supabase/admin"
import { prepareEmailHtml, prepareSubject } from "./render"
import type { MergeData } from "./render"
import { sendEmail } from "./resend"
import type { Contact, Store, Template } from "@/types"

interface SendCampaignEmailResult {
  success: boolean
  emailSendId?: string
  error?: string
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
  const supabase = createAdminClient()

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
    .single()

  if (insertError || !emailSend) {
    return {
      success: false,
      error: insertError?.message || "Failed to create email_send",
    }
  }

  // 2. Build merge data from contact + store + eventData
  const mergeData: MergeData = {
    contact: {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    },
    store: {
      name: store.name,
      url: store.shopify_domain ? `https://${store.shopify_domain}` : "",
    },
  }

  // Merge eventData into appropriate MergeData fields
  if (eventData) {
    if (eventData.order_number || eventData.order_total || eventData.order_tracking_url) {
      mergeData.order = {
        order_number: eventData.order_number,
        order_total: eventData.order_total,
        tracking_url: eventData.order_tracking_url,
      }
    }
    if (eventData.cart_total || eventData.cart_url) {
      mergeData.cart = {
        total: eventData.cart_total,
        url: eventData.cart_url,
      }
    }
    if (eventData.product_name || eventData.product_image || eventData.product_price || eventData.product_url) {
      mergeData.product = {
        name: eventData.product_name,
        image: eventData.product_image,
        price: eventData.product_price,
        url: eventData.product_url,
      }
    }
    if (eventData.discount_code) {
      mergeData.discount_code = eventData.discount_code
    }
  }

  // 3. Prepare HTML with tracking
  const html = prepareEmailHtml(
    template.html || "",
    mergeData,
    emailSend.id as string
  )

  // 4. Render subject with merge tags
  const subject = prepareSubject(
    template.subject || store.name,
    mergeData
  )

  // 5. Send via Resend
  try {
    const result = await sendEmail({
      to: contact.email,
      from: store.sender_email || `noreply@${store.shopify_domain || "mail.convertfy.com.br"}`,
      senderName: store.sender_name || store.name,
      subject,
      html,
      replyTo: store.reply_to || undefined,
      tags: {
        store_id: store.id,
        ...(campaignId ? { campaign_id: campaignId } : {}),
        ...(flowId ? { flow_id: flowId } : {}),
      },
    })

    // 6. Update email_send status
    if (result.error) {
      await supabase
        .from("email_sends")
        .update({ status: "failed" })
        .eq("id", emailSend.id)

      return { success: false, emailSendId: emailSend.id as string, error: result.error }
    }

    await supabase
      .from("email_sends")
      .update({
        resend_message_id: result.id,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", emailSend.id)

    return { success: true, emailSendId: emailSend.id as string }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown send error"
    await supabase
      .from("email_sends")
      .update({ status: "failed" })
      .eq("id", emailSend.id)

    return { success: false, emailSendId: emailSend.id as string, error: errorMessage }
  }
}
