import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveSegment } from "@/lib/segments/resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  // Fetch all segments
  const { data: segments, error } = await supabase
    .from("segments")
    .select("id, store_id");

  if (error || !segments) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch segments" },
      { status: 500 }
    );
  }

  let processed = 0;

  for (const segment of segments) {
    try {
      const storeId = segment.store_id as string;
      const segmentId = segment.id as string;

      const contactIds = await resolveSegment(segmentId, storeId);

      await supabase
        .from("segments")
        .update({ contact_count: contactIds.length })
        .eq("id", segmentId);

      processed++;
    } catch (err) {
      console.error(`Error processing segment ${segment.id}:`, err);
    }
  }

  return NextResponse.json({ processed });
}
