import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { processNode } from "@/lib/flows/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FlowExecutionRow {
  id: string;
  flow_id: string;
  contact_id: string;
  store_id: string;
  status: string;
  current_node_id: string | null;
  next_step_at: string | null;
  data: Record<string, unknown>;
  flows: {
    id: string;
    flow_definition: Record<string, unknown>;
  } | null;
}

export async function GET() {
  try {
    const db = supabaseAdmin();
    // Find waiting executions that are ready to advance
    const { data, error } = await db
      .from("flow_executions")
      .select("*, flows(*)")
      .eq("status", "waiting")
      .lte("next_step_at", new Date().toISOString())
      .limit(50);

    if (error) {
      console.error("Cron process-flows error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const executions = (data || []) as unknown as FlowExecutionRow[];
    let processed = 0;

    for (const execution of executions) {
      const flow = execution.flows;
      if (!flow) continue;

      const definition = flow.flow_definition as {
        edges: Array<{ source: string; target: string }>;
      };

      const currentNodeId = execution.current_node_id;
      if (!currentNodeId) continue;

      // Find next node after the delay
      const nextEdge = definition.edges.find(
        (e) => e.source === currentNodeId
      );

      if (nextEdge) {
        await processNode(execution.id, nextEdge.target);
        processed++;
      } else {
        // No next node, complete
        await db
          .from("flow_executions")
          .update({ status: "completed", current_node_id: null })
          .eq("id", execution.id);
        processed++;
      }
    }

    return NextResponse.json({
      ok: true,
      processed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron process-flows error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
