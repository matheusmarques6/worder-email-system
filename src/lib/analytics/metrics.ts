import { createAdminClient } from "@/lib/supabase/admin";

export async function getCampaignMetrics(campaignId: string) {
  const supabase = createAdminClient();

  const { data: sends } = await supabase
    .from("email_sends")
    .select("status, opened_at, clicked_at, bounced_at")
    .eq("campaign_id", campaignId);

  if (!sends) return null;

  return {
    total_sent: sends.length,
    total_delivered: sends.filter((s) => s.status === "delivered").length,
    total_opened: sends.filter((s) => s.opened_at).length,
    total_clicked: sends.filter((s) => s.clicked_at).length,
    total_bounced: sends.filter((s) => s.bounced_at).length,
  };
}

export async function getDashboardMetrics(storeId: string, days: number = 30) {
  const supabase = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { count: totalSent } = await supabase
    .from("email_sends")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId)
    .gte("sent_at", since.toISOString());

  const { count: totalOpened } = await supabase
    .from("email_sends")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId)
    .gte("sent_at", since.toISOString())
    .not("opened_at", "is", null);

  const { count: totalClicked } = await supabase
    .from("email_sends")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId)
    .gte("sent_at", since.toISOString())
    .not("clicked_at", "is", null);

  const { count: totalContacts } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("consent_email", "subscribed");

  const { count: activeFlows } = await supabase
    .from("flows")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("status", "live");

  return {
    totalSent: totalSent || 0,
    openRate:
      totalSent && totalSent > 0
        ? (((totalOpened || 0) / totalSent) * 100).toFixed(1)
        : "0",
    clickRate:
      totalSent && totalSent > 0
        ? (((totalClicked || 0) / totalSent) * 100).toFixed(1)
        : "0",
    totalContacts: totalContacts || 0,
    activeFlows: activeFlows || 0,
  };
}

export async function getEmailsOverTime(storeId: string, days: number = 30) {
  const supabase = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("email_sends")
    .select("sent_at")
    .eq("store_id", storeId)
    .gte("sent_at", since.toISOString())
    .order("sent_at", { ascending: true });

  if (!data) return [];

  // Group by date
  const grouped = new Map<string, number>();
  data.forEach((send) => {
    const date = new Date(send.sent_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    grouped.set(date, (grouped.get(date) || 0) + 1);
  });

  return Array.from(grouped.entries()).map(([date, count]) => ({
    date,
    emails: count,
  }));
}
