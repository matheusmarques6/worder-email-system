import { createAdminClient } from "@/lib/supabase/admin";
import type { Contact } from "@/types";

interface ABGroups {
  groupA: Contact[];
  groupB: Contact[];
}

/**
 * Split contacts into two groups for A/B testing
 */
export function splitContactsForABTest(
  contacts: Contact[],
  percentageA: number = 50
): ABGroups {
  const shuffled = [...contacts].sort(() => Math.random() - 0.5);
  const splitIndex = Math.ceil(shuffled.length * (percentageA / 100));

  return {
    groupA: shuffled.slice(0, splitIndex),
    groupB: shuffled.slice(splitIndex),
  };
}

interface ABTestResult {
  winner: "A" | "B" | "tie";
  openRateA: number;
  openRateB: number;
  sentA: number;
  sentB: number;
}

/**
 * Determine the winner of an A/B test by comparing open rates
 */
export async function determineWinner(
  campaignId: string
): Promise<ABTestResult> {
  const supabase = createAdminClient();

  const { data: sends } = await supabase
    .from("email_sends")
    .select("subject, opened_at")
    .eq("campaign_id", campaignId);

  if (!sends || sends.length === 0) {
    return { winner: "tie", openRateA: 0, openRateB: 0, sentA: 0, sentB: 0 };
  }

  // Group by subject (variant A = first subject, variant B = second)
  const subjects = [...new Set(sends.map((s) => s.subject))];
  if (subjects.length < 2) {
    return { winner: "tie", openRateA: 0, openRateB: 0, sentA: 0, sentB: 0 };
  }

  const groupA = sends.filter((s) => s.subject === subjects[0]);
  const groupB = sends.filter((s) => s.subject === subjects[1]);

  const openRateA =
    groupA.length > 0
      ? groupA.filter((s) => s.opened_at).length / groupA.length
      : 0;
  const openRateB =
    groupB.length > 0
      ? groupB.filter((s) => s.opened_at).length / groupB.length
      : 0;

  let winner: "A" | "B" | "tie" = "tie";
  if (openRateA > openRateB) winner = "A";
  else if (openRateB > openRateA) winner = "B";

  return {
    winner,
    openRateA: Math.round(openRateA * 100 * 10) / 10,
    openRateB: Math.round(openRateB * 100 * 10) / 10,
    sentA: groupA.length,
    sentB: groupB.length,
  };
}

/**
 * After determining winner, update campaign stats
 */
export async function applyWinner(campaignId: string): Promise<void> {
  const supabase = createAdminClient();
  const result = await determineWinner(campaignId);

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (!campaign) return;

  const stats = (campaign.stats as Record<string, unknown>) || {};
  const abTest = (stats.ab_test as Record<string, unknown>) || {};

  await supabase
    .from("campaigns")
    .update({
      stats: {
        ...stats,
        ab_test: {
          ...abTest,
          winner: result.winner,
          open_rate_a: result.openRateA,
          open_rate_b: result.openRateB,
        },
      },
    })
    .eq("id", campaignId);
}
