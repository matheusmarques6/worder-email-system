import { createAdminClient } from "@/lib/supabase/admin"

interface Contact { id: string; email: string; first_name?: string | null; last_name?: string | null; phone?: string | null }

export function splitContactsForABTest(contacts: Contact[], percentageA: number = 50): { groupA: Contact[]; groupB: Contact[] } {
  const shuffled = [...contacts].sort(() => Math.random() - 0.5)
  const splitIndex = Math.ceil(shuffled.length * (percentageA / 100))
  return { groupA: shuffled.slice(0, splitIndex), groupB: shuffled.slice(splitIndex) }
}

export async function determineWinner(campaignId: string): Promise<{ winner: "A" | "B" | "tie"; openRateA: number; openRateB: number }> {
  const supabase = createAdminClient()
  const { data: sends } = await supabase.from("email_sends").select("subject, opened_at").eq("campaign_id", campaignId)
  if (!sends || sends.length === 0) return { winner: "tie", openRateA: 0, openRateB: 0 }
  const subjects = [...new Set(sends.map((s) => s.subject))]
  if (subjects.length < 2) return { winner: "tie", openRateA: 0, openRateB: 0 }
  const groupA = sends.filter((s) => s.subject === subjects[0])
  const groupB = sends.filter((s) => s.subject === subjects[1])
  const openRateA = groupA.length > 0 ? groupA.filter((s) => s.opened_at).length / groupA.length : 0
  const openRateB = groupB.length > 0 ? groupB.filter((s) => s.opened_at).length / groupB.length : 0
  return { winner: openRateA > openRateB ? "A" : openRateB > openRateA ? "B" : "tie", openRateA: Math.round(openRateA * 1000) / 10, openRateB: Math.round(openRateB * 1000) / 10 }
}
