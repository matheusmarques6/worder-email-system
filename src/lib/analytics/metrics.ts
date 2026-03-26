import { createAdminClient } from "@/lib/supabase/admin"

export interface CampaignMetrics {
  total: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  revenue: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  unsubscribe_rate: number
}

export interface DashboardMetrics {
  emails_sent: number
  avg_open_rate: number
  avg_click_rate: number
  active_contacts: number
  live_flows: number
  total_revenue: number
}

export interface DayMetric {
  day: string
  sent: number
  opened: number
  clicked: number
}

export interface TopCampaign {
  id: string
  name: string
  sent: number
  open_rate: number
  click_rate: number
  revenue: number
}

export interface TopFlow {
  id: string
  name: string
  trigger_type: string
  entered: number
  emails_sent: number
  revenue: number
}

const emptyCampaignMetrics: CampaignMetrics = {
  total: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounced: 0,
  unsubscribed: 0,
  revenue: 0,
  open_rate: 0,
  click_rate: 0,
  bounce_rate: 0,
  unsubscribe_rate: 0,
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
  const supabase = createAdminClient()

  try {
    const { data: sends } = await supabase
      .from("email_sends")
      .select("status, opened_at, clicked_at")
      .eq("campaign_id", campaignId)

    if (!sends || sends.length === 0) {
      return { ...emptyCampaignMetrics }
    }

    const total = sends.length
    const delivered = sends.filter(
      (s) =>
        s.status === "delivered" ||
        s.status === "sent" ||
        s.status === "opened" ||
        s.status === "clicked"
    ).length
    const opened = sends.filter((s) => s.opened_at !== null).length
    const clicked = sends.filter((s) => s.clicked_at !== null).length
    const bounced = sends.filter((s) => s.status === "bounced").length
    const unsubscribed = sends.filter((s) => s.status === "unsubscribed").length

    return {
      total,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      revenue: 0,
      open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
      click_rate: delivered > 0 ? (clicked / delivered) * 100 : 0,
      bounce_rate: total > 0 ? (bounced / total) * 100 : 0,
      unsubscribe_rate: total > 0 ? (unsubscribed / total) * 100 : 0,
    }
  } catch {
    return { ...emptyCampaignMetrics }
  }
}

export async function getDashboardMetrics(
  storeId: string,
  days = 30
): Promise<DashboardMetrics> {
  const supabase = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const { count: emailsSent } = await supabase
      .from("email_sends")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId)
      .gte("created_at", since.toISOString())

    const { count: activeContacts } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("subscribed", true)

    const { count: liveFlows } = await supabase
      .from("flows")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "live")

    const { data: recentSends } = await supabase
      .from("email_sends")
      .select("opened_at, clicked_at")
      .eq("store_id", storeId)
      .gte("created_at", since.toISOString())

    const totalSends = recentSends?.length ?? 0
    const opens = recentSends?.filter((s) => s.opened_at !== null).length ?? 0
    const clicks = recentSends?.filter((s) => s.clicked_at !== null).length ?? 0

    return {
      emails_sent: emailsSent ?? 0,
      avg_open_rate: totalSends > 0 ? (opens / totalSends) * 100 : 0,
      avg_click_rate: totalSends > 0 ? (clicks / totalSends) * 100 : 0,
      active_contacts: activeContacts ?? 0,
      live_flows: liveFlows ?? 0,
      total_revenue: 0,
    }
  } catch {
    return {
      emails_sent: 0,
      avg_open_rate: 0,
      avg_click_rate: 0,
      active_contacts: 0,
      live_flows: 0,
      total_revenue: 0,
    }
  }
}

export async function getEmailsOverTime(
  storeId: string,
  days = 30
): Promise<DayMetric[]> {
  const supabase = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const { data: sends } = await supabase
      .from("email_sends")
      .select("created_at, opened_at, clicked_at")
      .eq("store_id", storeId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })

    if (!sends || sends.length === 0) return []

    const dayMap: Record<string, DayMetric> = {}
    for (const send of sends) {
      const day = send.created_at.split("T")[0]
      if (!dayMap[day]) {
        dayMap[day] = { day, sent: 0, opened: 0, clicked: 0 }
      }
      dayMap[day].sent++
      if (send.opened_at) dayMap[day].opened++
      if (send.clicked_at) dayMap[day].clicked++
    }

    return Object.values(dayMap).sort((a, b) => a.day.localeCompare(b.day))
  } catch {
    return []
  }
}

export async function getTopCampaigns(
  storeId: string,
  limit = 5
): Promise<TopCampaign[]> {
  const supabase = createAdminClient()

  try {
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, name")
      .eq("store_id", storeId)
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(limit)

    if (!campaigns || campaigns.length === 0) return []

    const result: TopCampaign[] = []
    for (const campaign of campaigns) {
      const metrics = await getCampaignMetrics(campaign.id)
      result.push({
        id: campaign.id,
        name: campaign.name,
        sent: metrics.total,
        open_rate: metrics.open_rate,
        click_rate: metrics.click_rate,
        revenue: metrics.revenue,
      })
    }

    return result.sort((a, b) => b.open_rate - a.open_rate)
  } catch {
    return []
  }
}

export async function getTopFlows(
  storeId: string,
  limit = 5
): Promise<TopFlow[]> {
  const supabase = createAdminClient()

  try {
    const { data: flows } = await supabase
      .from("flows")
      .select("id, name, trigger_type")
      .eq("store_id", storeId)
      .eq("status", "live")
      .limit(limit)

    if (!flows || flows.length === 0) return []

    const result: TopFlow[] = []
    for (const flow of flows) {
      const { count: entered } = await supabase
        .from("flow_executions")
        .select("*", { count: "exact", head: true })
        .eq("flow_id", flow.id)

      const { count: emailsSent } = await supabase
        .from("email_sends")
        .select("*", { count: "exact", head: true })
        .eq("flow_id", flow.id)

      result.push({
        id: flow.id,
        name: flow.name,
        trigger_type: flow.trigger_type,
        entered: entered ?? 0,
        emails_sent: emailsSent ?? 0,
        revenue: 0,
      })
    }

    return result.sort((a, b) => b.emails_sent - a.emails_sent)
  } catch {
    return []
  }
}

export async function getRevenueAttribution(
  storeId: string,
  days = 30
): Promise<{ week: string; revenue: number }[]> {
  const supabase = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const { data: events } = await supabase
      .from("events")
      .select("created_at, properties")
      .eq("store_id", storeId)
      .eq("type", "placed_order")
      .gte("created_at", since.toISOString())

    if (!events || events.length === 0) return []

    const weekMap: Record<string, number> = {}
    for (const event of events) {
      const weekStart = getWeekStart(event.created_at)
      const revenue =
        (event.properties as Record<string, unknown>)?.total_price as number ?? 0
      weekMap[weekStart] = (weekMap[weekStart] ?? 0) + revenue
    }

    return Object.entries(weekMap)
      .map(([week, revenue]) => ({ week, revenue }))
      .sort((a, b) => a.week.localeCompare(b.week))
  } catch {
    return []
  }
}

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  return date.toISOString().split("T")[0]
}
