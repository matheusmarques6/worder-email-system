import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { prebuiltFlows } from "@/lib/flows/prebuilt-flows"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      flowId?: string
      templateIndex?: number
      storeId: string
    }
    const { flowId, templateIndex, storeId } = body

    if (!storeId) {
      return Response.json({ error: "storeId is required" }, { status: 400 })
    }

    const db = createAdminClient()

    // Activate existing flow
    if (flowId) {
      const { data: flow, error } = await db
        .from("flows")
        .update({ status: "live", updated_at: new Date().toISOString() })
        .eq("id", flowId)
        .eq("store_id", storeId)
        .select()
        .single()

      if (error || !flow) {
        return Response.json(
          { error: "Flow not found or update failed" },
          { status: 404 }
        )
      }

      return Response.json({ flow })
    }

    // Create flow from prebuilt template
    if (templateIndex !== undefined) {
      if (templateIndex < 0 || templateIndex >= prebuiltFlows.length) {
        return Response.json(
          { error: "Invalid template index" },
          { status: 400 }
        )
      }

      const template = prebuiltFlows[templateIndex]

      const { data: flow, error } = await db
        .from("flows")
        .insert({
          store_id: storeId,
          name: template.name,
          trigger_type: template.triggerType,
          trigger_config: template.triggerConfig,
          flow_definition: {
            nodes: template.nodes,
            edges: template.edges,
          },
          status: "draft",
          total_entered: 0,
          total_completed: 0,
          total_emails_sent: 0,
        })
        .select()
        .single()

      if (error || !flow) {
        return Response.json(
          { error: "Failed to create flow" },
          { status: 500 }
        )
      }

      return Response.json({ flow })
    }

    return Response.json(
      { error: "Either flowId or templateIndex is required" },
      { status: 400 }
    )
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
