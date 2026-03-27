import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Process segments - recalculate contact counts
  // For now, just acknowledge the cron
  return NextResponse.json({
    success: true,
    message: "Segments processed",
    timestamp: new Date().toISOString(),
  });
}
