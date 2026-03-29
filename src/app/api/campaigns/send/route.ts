import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendCampaignEmail } from "@/lib/email/send-campaign-email"
import type { Contact, Store, Template } from "@/types"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json()
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Fetch campaign with template and store via joins
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, templates(*), stores(*)")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const template = campaign.templates as unknown as Template
    const store = campaign.stores as unknown as Store

    if (!template?.html) {
      return NextResponse.json({ error: "Campaign has no template or HTML" }, { status: 400 })
    }

    // 2. Resolve contacts from list_id, segment_id, or all store contacts
    let contacts: Array<{
      id: string
      email: string
      first_name: string | null
      last_name: string | null
      phone: string | null
      subscribed: boolean
    }> = []

    if (campaign.list_id) {
      const { data } = await supabase
        .from("list_members")
        .select("contacts(id, email, first_name, last_name, phone, subscribed)")
        .eq("list_id", campaign.list_id)

      contacts = (data ?? [])
        .map((m: Record<string, unknown>) => m.contacts as typeof contacts[0])
        .filter(Boolean)
    } else if (campaign.segment_id) {
      const { resolveSegmentContacts } = await import("@/lib/segments/resolver")
      contacts = await resolveSegmentContacts(campaign.segment_id, campaign.store_id)
    } else {
      const { data } = await supabase
        .from("contacts")
        .select("id, email, first_name, last_name, phone, subscribed")
        .eq("store_id", campaign.store_id)
        .eq("subscribed", true)

      contacts = data ?? []
    }

    // 3. Filter subscribed only
    contacts = contacts.filter((c) => c.subscribed !== false)

    // 4. Exclude unengaged if option set (no opens in 90 days)
    if (campaign.exclude_unengaged && contacts.length > 0) {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data: engagedSends } = await supabase
        .from("email_sends")
        .select("contact_id")
        .in("contact_id", contacts.map((c) => c.id))
        .eq("store_id", campaign.store_id as string)
        .not("opened_at", "is", null)
        .gte("opened_at", ninetyDaysAgo.toISOString())

      if (engagedSends) {
        const engagedIds = new Set(engagedSends.map((s: { contact_id: string }) => s.contact_id))
        contacts = contacts.filter((c) => engagedIds.has(c.id))
      }
    }

    // 5. Smart sending filter (skip contacts who received email in last 16h)
    if (campaign.smart_sending && contacts.length > 0) {
      const sixteenHoursAgo = new Date()
      sixteenHoursAgo.setHours(sixteenHoursAgo.getHours() - 16)

      const { data: recentSends } = await supabase
        .from("email_sends")
        .select("contact_id")
        .in("contact_id", contacts.map((c) => c.id))
        .eq("store_id", campaign.store_id as string)
        .gte("created_at", sixteenHoursAgo.toISOString())

      if (recentSends) {
        const recentIds = new Set(recentSends.map((s: { contact_id: string }) => s.contact_id))
        contacts = contacts.filter((c) => !recentIds.has(c.id))
      }
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: "No eligible contacts to send to" }, { status: 400 })
    }

    // 6. Update campaign to sending
    await supabase
      .from("campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId)

    // 7. Send emails - handle A/B testing with batch sending
    let sentCount = 0
    let failedCount = 0

    const sendToContact = async (contact: typeof contacts[0], subjectOverride?: string) => {
      const templateWithSubject: Template = {
        ...template,
        subject: subjectOverride || template.subject,
      }

      const result = await sendCampaignEmail(
        contact as unknown as Contact,
        templateWithSubject,
        store,
        campaignId
      )

      if (result.success) {
        sentCount++
      } else {
        failedCount++
      }
    }

    // Determine which contacts get which subject (A/B testing)
    let contactsToSend: Array<{ contact: typeof contacts[0]; subject?: string }> = []

    if (campaign.ab_test_enabled && campaign.subject_b) {
      const splitPct = (campaign.ab_split as number) ?? 50
      const splitIndex = Math.floor(contacts.length * (splitPct / 100))
      const groupA = contacts.slice(0, splitIndex)
      const groupB = contacts.slice(splitIndex)

      contactsToSend = [
        ...groupA.map((c) => ({ contact: c, subject: campaign.subject as string })),
        ...groupB.map((c) => ({ contact: c, subject: campaign.subject_b as string })),
      ]
    } else {
      contactsToSend = contacts.map((c) => ({ contact: c, subject: campaign.subject as string }))
    }

    // BATCH SENDING: send in batches of 10 with 500ms delay between batches
    const BATCH_SIZE = 10
    for (let i = 0; i < contactsToSend.length; i += BATCH_SIZE) {
      const batch = contactsToSend.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map((item) => sendToContact(item.contact, item.subject))
      )

      // Delay between batches to respect Resend rate limits
      if (i + BATCH_SIZE < contactsToSend.length) {
        await sleep(500)
      }
    }

    // 8. Update campaign to sent
    await supabase
      .from("campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        total_sent: sentCount,
        total_failed: failedCount,
      })
      .eq("id", campaignId)

    return NextResponse.json({
      success: true,
      sent_count: sentCount,
      failed_count: failedCount,
    })
  } catch (err) {
    console.error("Campaign send error:", err)
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 })
  }
}
