import { sendEmail } from "./resend"
import { prepareEmailHtml, prepareSubject } from "./render"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface CampaignEmailParams {
  campaignId: string
  contactId: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  subject: string
  templateHtml: string
  storeName: string
  storeUrl: string
  storeId: string
  fromAddress: string
  previewText?: string
}

export async function sendCampaignEmail(
  params: CampaignEmailParams
): Promise<{ success: boolean; emailSendId?: string }> {
  const db = supabaseAdmin()

  const { data: emailSend, error: insertError } = await db
    .from("email_sends")
    .insert({
      campaign_id: params.campaignId,
      contact_id: params.contactId,
      to_email: params.email,
      subject: params.subject,
      store_id: params.storeId,
      status: "queued",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (insertError || !emailSend) {
    return { success: false }
  }

  const emailSendId = emailSend.id as string

  const mergeData = {
    contact: {
      first_name: params.firstName,
      last_name: params.lastName,
      email: params.email,
      phone: params.phone,
    },
    store: {
      name: params.storeName,
      url: params.storeUrl,
    },
  }

  const processedHtml = prepareEmailHtml(params.templateHtml, mergeData, emailSendId)
  const processedSubject = prepareSubject(params.subject, mergeData)

  let finalHtml = processedHtml
  if (params.previewText) {
    const preview = `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.previewText}</div>`
    finalHtml = finalHtml.replace(/<body[^>]*>/, (match) => `${match}${preview}`)
  }

  const result = await sendEmail({
    from: params.fromAddress,
    to: params.email,
    subject: processedSubject,
    html: finalHtml,
    tags: [
      { name: "campaign_id", value: params.campaignId },
      { name: "store_id", value: params.storeId },
    ],
  })

  if (result.success) {
    await db
      .from("email_sends")
      .update({
        status: "sent",
        provider_id: result.messageId ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", emailSendId)
  } else {
    await db
      .from("email_sends")
      .update({
        status: "failed",
        error_message: result.error ?? "Unknown error",
      })
      .eq("id", emailSendId)
  }

  return { success: result.success, emailSendId }
}
