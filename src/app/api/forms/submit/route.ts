import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const submitSchema = z.object({
  form_id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  custom_fields: z.record(z.string(), z.string()).optional(),
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient()
    const body = await request.json()
    const parsed = submitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inv\u00e1lidos", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders }
      )
    }

    const { form_id, email, name, phone, custom_fields } = parsed.data

    // Fetch form to get store_id and list_id from config
    const { data: form, error: formError } = await supabaseAdmin
      .from("forms")
      .select("id, store_id, config, status")
      .eq("id", form_id)
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { success: false, error: "Formul\u00e1rio n\u00e3o encontrado" },
        { status: 404, headers: corsHeaders }
      )
    }

    if (form.status === "inactive") {
      return NextResponse.json(
        { success: false, error: "Formul\u00e1rio inativo" },
        { status: 403, headers: corsHeaders }
      )
    }

    const storeId = form.store_id as string
    const formConfig = form.config as Record<string, unknown>
    const listId = formConfig?.listId as string | undefined

    // Upsert contact (match by email + store_id)
    const contactData: Record<string, unknown> = {
      store_id: storeId,
      email,
      source: "form",
      updated_at: new Date().toISOString(),
    }

    if (name) {
      contactData.first_name = name.split(" ")[0]
      const lastNameParts = name.split(" ").slice(1)
      if (lastNameParts.length > 0) {
        contactData.last_name = lastNameParts.join(" ")
      }
    }

    if (phone) {
      contactData.phone = phone
    }

    if (custom_fields && Object.keys(custom_fields).length > 0) {
      contactData.properties = custom_fields
    }

    const { data: contact, error: contactError } = await supabaseAdmin
      .from("contacts")
      .upsert(
        contactData,
        { onConflict: "email,store_id", ignoreDuplicates: false }
      )
      .select("id")
      .single()

    if (contactError) {
      console.error("Error upserting contact:", contactError)
      return NextResponse.json(
        { success: false, error: "Erro ao processar contato" },
        { status: 500, headers: corsHeaders }
      )
    }

    // Add to list if configured
    if (listId && contact) {
      await supabaseAdmin
        .from("list_members")
        .upsert(
          {
            list_id: listId,
            contact_id: contact.id,
            store_id: storeId,
            status: "active",
            created_at: new Date().toISOString(),
          },
          { onConflict: "list_id,contact_id" }
        )
    }

    // Increment submissions count
    await supabaseAdmin.rpc("increment_form_submissions", {
      p_form_id: form_id,
    }).then(async (rpcResult) => {
      // Fallback if RPC doesn't exist: manual increment
      if (rpcResult.error) {
        const { data: currentForm } = await supabaseAdmin
          .from("forms")
          .select("submissions_count")
          .eq("id", form_id)
          .single()

        const currentCount = (currentForm?.submissions_count as number) ?? 0
        await supabaseAdmin
          .from("forms")
          .update({ submissions_count: currentCount + 1 })
          .eq("id", form_id)
      }
    })

    // Track form submission event
    await supabaseAdmin.from("events").insert({
      store_id: storeId,
      contact_id: contact?.id,
      event_type: "form_submitted",
      properties: {
        form_id,
        email,
        name: name || null,
        phone: phone || null,
        custom_fields: custom_fields || null,
      },
    })

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500, headers: corsHeaders }
    )
  }
}
