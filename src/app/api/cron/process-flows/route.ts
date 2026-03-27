import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processNode } from "@/lib/flows/actions";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find waiting executions that are due
  const { data: executions } = await supabase
    .from("flow_executions")
    .select("*")
    .eq("status", "waiting")
    .lte("next_step_at", new Date().toISOString())
    .limit(50);

  if (!executions || executions.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const execution of executions) {
    try {
      // Get flow definition
      const { data: flow } = await supabase
        .from("flows")
        .select("flow_definition")
        .eq("id", execution.flow_id)
        .single();

      if (!flow) continue;

      const definition = flow.flow_definition as {
        nodes: Array<{ id: string; type: string; data: Record<string, unknown> }>;
        edges: Array<{ source: string; target: string; sourceHandle?: string }>;
      };

      // Find current node
      const currentNode = definition.nodes.find(
        (n) => n.id === execution.current_node_id
      );
      if (!currentNode) continue;

      // Find next node after the delay
      const nextEdge = definition.edges.find(
        (e) => e.source === currentNode.id
      );
      if (!nextEdge) {
        // No next node - complete execution
        await supabase
          .from("flow_executions")
          .update({ status: "completed" })
          .eq("id", execution.id);
        continue;
      }

      const nextNode = definition.nodes.find(
        (n) => n.id === nextEdge.target
      );
      if (!nextNode) continue;

      // Update execution status and process next node
      await supabase
        .from("flow_executions")
        .update({
          status: "active",
          current_node_id: nextNode.id,
          next_step_at: null,
        })
        .eq("id", execution.id);

      await processNode(execution, nextNode, definition, supabase);
      processed++;
    } catch (error) {
      console.error(`Error processing execution ${execution.id}:`, error);
      await supabase
        .from("flow_executions")
        .update({ status: "failed" })
        .eq("id", execution.id);
    }
  }

  return NextResponse.json({ processed });
}
