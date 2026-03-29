import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const SAMPLE_MERGE_DATA: Record<string, string> = {
  first_name: "Maria",
  last_name: "Silva",
  email: "maria@exemplo.com",
  store_name: "Minha Loja",
  store_url: "https://minhaloja.com",
  order_number: "1042",
  order_total: "R$ 199,90",
  product_name: "Camiseta Premium",
  product_url: "https://minhaloja.com/produto/camiseta",
  product_image: "https://via.placeholder.com/300x300",
  coupon_code: "BEMVINDO10",
  unsubscribe_url: "#",
  current_year: new Date().getFullYear().toString(),
}

function renderMergeData(html: string): string {
  let rendered = html
  for (const [key, value] of Object.entries(SAMPLE_MERGE_DATA)) {
    rendered = rendered.replace(
      new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi"),
      value
    )
  }
  return rendered
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      html?: string
      templateId?: string
      storeId?: string
    }
    const { html, templateId, storeId } = body

    if (html) {
      return Response.json({ html: renderMergeData(html) })
    }

    if (templateId) {
      const db = createAdminClient()

      const query = db
        .from("templates")
        .select("html")
        .eq("id", templateId)

      if (storeId) {
        query.eq("store_id", storeId)
      }

      const { data: template, error } = await query.single()

      if (error || !template) {
        return Response.json(
          { error: "Template not found" },
          { status: 404 }
        )
      }

      const templateHtml = (template as Record<string, unknown>).html as string | null
      if (!templateHtml) {
        return Response.json(
          { error: "Template has no HTML content" },
          { status: 400 }
        )
      }

      return Response.json({ html: renderMergeData(templateHtml) })
    }

    return Response.json(
      { error: "Either html or templateId is required" },
      { status: 400 }
    )
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
