import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, storeName, email } = await request.json()

    if (!userId || !storeName) {
      return NextResponse.json(
        { error: "userId and storeName are required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if store already exists for this user
    const { data: existing } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ store: existing })
    }

    // Create new store using service role (bypasses RLS)
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({
        user_id: userId,
        name: storeName,
        sender_name: storeName,
        sender_email: email ? `noreply@mail.convertfy.com.br` : null,
      })
      .select("id, name")
      .single()

    if (storeError) {
      console.error("Store creation error:", storeError)
      return NextResponse.json(
        { error: storeError.message },
        { status: 500 }
      )
    }

    // Seed prebuilt templates
    if (store?.id) {
      try {
        const templateFiles = [
          { name: "Boas-vindas", category: "welcome" },
          { name: "Carrinho Abandonado", category: "abandoned-cart" },
          { name: "Confirmação de Pedido", category: "order-confirm" },
          { name: "Pós-compra", category: "post-purchase" },
          { name: "Newsletter", category: "newsletter" },
        ]

        for (const tmpl of templateFiles) {
          await supabase.from("templates").insert({
            store_id: store.id,
            name: tmpl.name,
            category: tmpl.category,
            is_prebuilt: true,
            type: "email",
            html: `<h1>${tmpl.name}</h1><p>Template pré-definido</p>`,
            design_json: {},
          })
        }
      } catch {
        // Templates seed is non-critical
      }
    }

    return NextResponse.json({ store })
  } catch (err) {
    console.error("Setup store error:", err)
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    )
  }
}
