import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { processNode } from "@/lib/flows/engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = createAdminClient()

    // Find waiting executions that are ready to advance
    const { data, error } = await db
      .from("flow_executions")
      .select("id, current_node_id, flow_id, contact_id, store_id, status")
      .eq("status", "waiting")
      .lte("next_step_at", new Date().toISOString())
      .limit(50)

    if (error) {
      console.error("Cron process-flows error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const executions = (data || []) as Array<{
      id: string
      current_node_id: string | null
      flow_id: string
      contact_id: string
      store_id: string
      status: string
    }>

    let processed = 0

    for (const execution of executions) {
      if (!execution.current_node_id) continue

      await processNode({
        id: execution.id,
        current_node_id: execution.current_node_id,
      })
      processed++
    }

    return NextResponse.json({
      ok: true,
      processed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron process-flows error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
