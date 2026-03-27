import { createAdminClient } from "@/lib/supabase/admin"

export interface ClickMapEntry {
  url: string
  clicks: number
  percentage: number
}

export async function getClickMap(campaignId: string): Promise<ClickMapEntry[]> {
  const supabase = createAdminClient()

  try {
    // Get all click events for this campaign's email sends
    const { data: sends } = await supabase
      .from("email_sends")
      .select("id")
      .eq("campaign_id", campaignId)

    if (!sends || sends.length === 0) return []

    const sendIds = sends.map((s) => s.id)

    // Get click events
    const { data: clicks } = await supabase
      .from("events")
      .select("properties")
      .eq("event_type", "email_clicked")
      .in("email_send_id", sendIds)

    if (!clicks || clicks.length === 0) return []

    // Count clicks per URL
    const urlCounts: Record<string, number> = {}
    let totalClicks = 0

    for (const click of clicks) {
      const props = click.properties as Record<string, unknown>
      const url = String(props?.url ?? props?.link ?? "unknown")
      urlCounts[url] = (urlCounts[url] ?? 0) + 1
      totalClicks++
    }

    // Build sorted result
    const entries: ClickMapEntry[] = Object.entries(urlCounts)
      .map(([url, count]) => ({
        url,
        clicks: count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)

    return entries
  } catch {
    return []
  }
}
