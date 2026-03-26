import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

    // 2. Resolve contacts based on list_id or segment_id
    let contacts: { id: string; email: string; first_name: string | null }[] = []

    if (campaign.list_id) {
      const { data } = await supabase
        .from("list_members")
        .select("contacts(id, email, first_name)")
        .eq("list_id", campaign.list_id)

      contacts = (data ?? [])
        .map((m: Record<string, unknown>) => m.contacts as { id: string; email: string; first_name: string | null })
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
        .select("id, email, first_name")
        .in("id", contactIds)
        .eq("subscribed", true)

      contacts = subscribedContacts ?? []
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
    const abEnabled = campaign.ab_test_enabled

    if (abEnabled && campaign.subject_b) {
      const splitPct = campaign.ab_split ?? 50
      const splitIndex = Math.floor(contacts.length * (splitPct / 100))
      const groupA = contacts.slice(0, splitIndex)
      const groupB = contacts.slice(splitIndex)

      // Send to group A with subject A
      for (const contact of groupA) {
        await createEmailSend(supabase, {
          campaignId,
          contactId: contact.id,
          email: contact.email,
          subject: campaign.subject ?? "",
          storeId: campaign.store_id,
          variant: "A",
        })
        sentCount++
      }

      // Send to group B with subject B
      for (const contact of groupB) {
        await createEmailSend(supabase, {
          campaignId,
          contactId: contact.id,
          email: contact.email,
          subject: campaign.subject_b,
          storeId: campaign.store_id,
          variant: "B",
        })
        sentCount++
      }
    } else {
      // Normal send
      for (const contact of contacts) {
        await createEmailSend(supabase, {
          campaignId,
          contactId: contact.id,
          email: contact.email,
          subject: campaign.subject ?? "",
          storeId: campaign.store_id,
        })
        sentCount++
      }
    }

    // 8. Update campaign to sent
    await supabase
      .from("campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        stats: { sent: sentCount, opened: 0, clicked: 0, bounced: 0, revenue: 0 },
      })
      .eq("id", campaignId)

    return NextResponse.json({ success: true, sent_count: sentCount })
  } catch (err) {
    console.error("Campaign send error:", err)
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 })
  }
}

async function createEmailSend(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    campaignId: string
    contactId: string
    email: string
    subject: string
    storeId: string
    variant?: string
  }
) {
  const { error } = await supabase.from("email_sends").insert({
    campaign_id: params.campaignId,
    contact_id: params.contactId,
    to_email: params.email,
    subject: params.subject,
    store_id: params.storeId,
    variant: params.variant ?? null,
    status: "queued",
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Failed to create email_send:", error)
  }
}
