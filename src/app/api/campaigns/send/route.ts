import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/admin"
import { prepareEmailHtml, prepareSubject } from "@/lib/email/render"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

interface CampaignContact {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string | null
  total_orders: number | null
  total_spent: number | null
  gender: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json()
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Fetch campaign with template and store
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, templates(*), stores(*)")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const template = campaign.templates as Record<string, unknown> | null
    const store = campaign.stores as Record<string, unknown> | null

    if (!template?.html) {
      return NextResponse.json({ error: "Campaign has no template or template HTML" }, { status: 400 })
    }

    // 2. Resolve contacts based on list_id or segment_id
    let contacts: CampaignContact[] = []

    if (campaign.list_id) {
      const { data } = await supabase
        .from("list_members")
        .select("contacts(id, email, first_name, last_name, phone, created_at, total_orders, total_spent, gender)")
        .eq("list_id", campaign.list_id)

      contacts = (data ?? [])
        .map((m: Record<string, unknown>) => m.contacts as CampaignContact)
        .filter(Boolean)
    } else if (campaign.segment_id) {
      // For now, return empty - segment resolution will be implemented later
      contacts = []
    }

    // 3. Filter subscribed only
    if (contacts.length > 0) {
      const contactIds = contacts.map(c => c.id)
      const { data: subscribedContacts } = await supabase
        .from("contacts")
        .select("id, email, first_name, last_name, phone, created_at, total_orders, total_spent, gender")
        .in("id", contactIds)
        .eq("subscribed", true)

      contacts = (subscribedContacts ?? []) as CampaignContact[]
    }

    // 4. Exclude unengaged if option set
    if (campaign.exclude_unengaged && contacts.length > 0) {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data: engagedSends } = await supabase
        .from("email_sends")
        .select("contact_id")
        .in("contact_id", contacts.map(c => c.id))
        .not("opened_at", "is", null)
        .gte("opened_at", ninetyDaysAgo.toISOString())

      if (engagedSends) {
        const engagedIds = new Set(engagedSends.map(s => s.contact_id))
        contacts = contacts.filter(c => engagedIds.has(c.id))
      }
    }

    // 5. Smart sending filter
    if (campaign.smart_sending && contacts.length > 0) {
      const sixteenHoursAgo = new Date()
      sixteenHoursAgo.setHours(sixteenHoursAgo.getHours() - 16)

      const { data: recentSends } = await supabase
        .from("email_sends")
        .select("contact_id")
        .in("contact_id", contacts.map(c => c.id))
        .gte("created_at", sixteenHoursAgo.toISOString())

      if (recentSends) {
        const recentIds = new Set(recentSends.map(s => s.contact_id))
        contacts = contacts.filter(c => !recentIds.has(c.id))
      }
    }

    // 6. Update campaign to sending
    await supabase
      .from("campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId)

    // 7. Handle A/B test splitting
    let sentCount = 0
    let failedCount = 0
    const abEnabled = campaign.ab_test_enabled

    const templateHtml = template.html as string
    const senderName = (campaign.sender_name as string) || (store?.name as string) || "Convertfy"
    const senderEmail = (campaign.sender_email as string) || `noreply@${process.env.RESEND_DOMAIN ?? "mail.convertfy.com"}`
    const fromAddress = `${senderName} <${senderEmail}>`
    const previewText = (campaign.preview_text as string) || ""
    const storeName = (store?.name as string) || ""
    const storeUrl = (store?.url as string) || ""

    if (abEnabled && campaign.subject_b) {
      const splitPct = campaign.ab_split ?? 50
      const splitIndex = Math.floor(contacts.length * (splitPct / 100))
      const groupA = contacts.slice(0, splitIndex)
      const groupB = contacts.slice(splitIndex)

      // Send to group A with subject A
      for (const contact of groupA) {
        const result = await createEmailSend(supabase, {
          campaignId,
          contact,
          subject: campaign.subject ?? "",
          storeId: campaign.store_id,
          storeName,
          storeUrl,
          templateHtml,
          fromAddress,
          previewText,
          variant: "A",
        })
        if (result.success) sentCount++
        else failedCount++
      }

      // Send to group B with subject B
      for (const contact of groupB) {
        const result = await createEmailSend(supabase, {
          campaignId,
          contact,
          subject: campaign.subject_b,
          storeId: campaign.store_id,
          storeName,
          storeUrl,
          templateHtml,
          fromAddress,
          previewText,
          variant: "B",
        })
        if (result.success) sentCount++
        else failedCount++
      }
    } else {
      // Normal send
      for (const contact of contacts) {
        const result = await createEmailSend(supabase, {
          campaignId,
          contact,
          subject: campaign.subject ?? "",
          storeId: campaign.store_id,
          storeName,
          storeUrl,
          templateHtml,
          fromAddress,
          previewText,
        })
        if (result.success) sentCount++
        else failedCount++
      }
    }

    // 8. Update campaign to sent
    await supabase
      .from("campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        stats: { sent: sentCount, failed: failedCount, opened: 0, clicked: 0, bounced: 0, revenue: 0 },
      })
      .eq("id", campaignId)

    return NextResponse.json({ success: true, sent_count: sentCount, failed_count: failedCount })
  } catch (err) {
    console.error("Campaign send error:", err)
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 })
  }
}

async function createEmailSend(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    campaignId: string
    contact: CampaignContact
    subject: string
    storeId: string
    storeName: string
    storeUrl: string
    templateHtml: string
    fromAddress: string
    previewText: string
    variant?: string
  }
): Promise<{ success: boolean }> {
  // 1. Create the email_sends record first to get its ID for tracking pixel
  const { data: emailSend, error: insertError } = await supabase
    .from("email_sends")
    .insert({
      campaign_id: params.campaignId,
      contact_id: params.contact.id,
      to_email: params.contact.email,
      subject: params.subject,
      store_id: params.storeId,
      variant: params.variant ?? null,
      status: "queued",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (insertError || !emailSend) {
    console.error("Failed to create email_send record:", insertError)
    return { success: false }
  }

  const emailSendId = emailSend.id as string

  // 2. Build merge data for this contact
  const mergeData = {
    contact: {
      first_name: params.contact.first_name,
      last_name: params.contact.last_name,
      email: params.contact.email,
      phone: params.contact.phone,
      created_at: params.contact.created_at ?? undefined,
      total_orders: params.contact.total_orders ?? undefined,
      total_spent: params.contact.total_spent ?? undefined,
      gender: params.contact.gender,
    },
    store: {
      name: params.storeName,
      url: params.storeUrl,
    },
  }

  // 3. Process merge tags in HTML and subject
  const processedHtml = prepareEmailHtml(params.templateHtml, mergeData, emailSendId)
  const processedSubject = prepareSubject(params.subject, mergeData)

  // 4. Build full HTML with preview text if provided
  let finalHtml = processedHtml
  if (params.previewText) {
    const previewSnippet = `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.previewText}</div>`
    finalHtml = finalHtml.replace(/<body[^>]*>/, (match) => `${match}${previewSnippet}`)
  }

  // 5. Actually send via Resend
  try {
    const { data: resendData, error: resendError } = await getResend().emails.send({
      from: params.fromAddress,
      to: [params.contact.email],
      subject: processedSubject,
      html: finalHtml,
      tags: [
        { name: "campaign_id", value: params.campaignId },
        { name: "store_id", value: params.storeId },
        ...(params.variant ? [{ name: "variant", value: params.variant }] : []),
      ],
    })

    if (resendError || !resendData) {
      console.error(`Resend error for ${params.contact.email}:`, resendError)
      await supabase
        .from("email_sends")
        .update({
          status: "failed",
          error_message: resendError?.message ?? "Unknown Resend error",
        })
        .eq("id", emailSendId)
      return { success: false }
    }

    // 6. Update email_send with Resend message ID and sent status
    await supabase
      .from("email_sends")
      .update({
        status: "sent",
        provider_id: resendData.id,
        sent_at: new Date().toISOString(),
      })
      .eq("id", emailSendId)

    return { success: true }
  } catch (err) {
    console.error(`Failed to send email to ${params.contact.email}:`, err)
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    await supabase
      .from("email_sends")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", emailSendId)
    return { success: false }
  }
}
