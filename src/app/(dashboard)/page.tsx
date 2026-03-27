import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!store) return null;

  // Fetch metrics
  const [
    { count: totalContacts },
    { count: totalEmailsSent },
    { count: activeFlows },
    { data: recentCampaigns },
    { data: flows },
    { data: emailEvents },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("email_sends").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("flows").select("*", { count: "exact", head: true }).eq("store_id", store.id).eq("status", "live"),
    supabase.from("campaigns").select("*").eq("store_id", store.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("flows").select("*").eq("store_id", store.id).eq("status", "live").limit(5),
    supabase.from("email_sends").select("sent_at, status").eq("store_id", store.id).gte("sent_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).order("sent_at", { ascending: true }),
  ]);

  // Calculate open/click rates from email_sends
  const totalOpened = emailEvents?.filter(e => e.status === "delivered").length || 0;
  const openRate = totalEmailsSent ? Math.round((totalOpened / (totalEmailsSent || 1)) * 100 * 10) / 10 : 0;

  // Build chart data - group emails by day over 30 days
  const chartData: { date: string; emails: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    const count = emailEvents?.filter(e => e.sent_at >= dayStart && e.sent_at < dayEnd).length || 0;
    chartData.push({ date: dateStr, emails: count });
  }

  const onboardingComplete = store.settings?.onboarding_complete === true;
  const onboardingStep = store.settings?.onboarding_step || 1;

  return (
    <DashboardContent
      totalContacts={totalContacts || 0}
      totalEmailsSent={totalEmailsSent || 0}
      activeFlows={activeFlows || 0}
      openRate={openRate}
      clickRate={0}
      chartData={chartData}
      recentCampaigns={recentCampaigns || []}
      activeFlowsList={flows || []}
      onboardingComplete={onboardingComplete}
      onboardingStep={onboardingStep}
    />
  );
}
