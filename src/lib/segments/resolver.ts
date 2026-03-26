import { createAdminClient } from "@/lib/supabase/admin";
import { buildSupabaseQuery } from "./query-builder";

export async function resolveSegment(
  segmentId: string,
  storeId: string
): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: segment } = await supabase
    .from("segments")
    .select("conditions")
    .eq("id", segmentId)
    .eq("store_id", storeId)
    .single();

  if (!segment) return [];

  const conditions = segment.conditions as {
    combinator: "and" | "or";
    rules: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };

  return buildSupabaseQuery(conditions, storeId, supabase);
}
