import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

import welcomeJson from "@/lib/email/templates/welcome.json"
import abandonedCartJson from "@/lib/email/templates/abandoned-cart.json"
import orderConfirmJson from "@/lib/email/templates/order-confirm.json"
import postPurchaseJson from "@/lib/email/templates/post-purchase.json"
import newsletterJson from "@/lib/email/templates/newsletter.json"

const PREBUILT_TEMPLATES = [
  {
    name: "Boas-vindas",
    category: "onboarding",
    design_json: welcomeJson,
    subject: "Bem-vindo(a) à nossa loja!",
  },
  {
    name: "Carrinho Abandonado",
    category: "revenue",
    design_json: abandonedCartJson,
    subject: "Você esqueceu algo no carrinho!",
  },
  {
    name: "Confirmação de Pedido",
    category: "transactional",
    design_json: orderConfirmJson,
    subject: "Seu pedido foi confirmado!",
  },
  {
    name: "Pós-compra",
    category: "engagement",
    design_json: postPurchaseJson,
    subject: "Como foi sua experiência?",
  },
  {
    name: "Newsletter",
    category: "marketing",
    design_json: newsletterJson,
    subject: "Novidades da semana",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { storeId: string }
    const { storeId } = body

    if (!storeId) {
      return Response.json({ error: "storeId is required" }, { status: 400 })
    }

    const db = createAdminClient()

    // Check if prebuilt templates already exist for this store
    const { count } = await db
      .from("templates")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("is_prebuilt", true)

    if (count && count > 0) {
      return Response.json({
        message: "Prebuilt templates already exist for this store",
        count: 0,
      })
    }

    const rows = PREBUILT_TEMPLATES.map((t) => ({
      store_id: storeId,
      name: t.name,
      category: t.category,
      subject: t.subject,
      design_json: t.design_json,
      is_prebuilt: true,
      type: "email" as const,
    }))

    const { error } = await db.from("templates").insert(rows)

    if (error) {
      return Response.json(
        { error: "Failed to seed templates" },
        { status: 500 }
      )
    }

    return Response.json({ count: rows.length })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
