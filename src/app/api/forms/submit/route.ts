import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { form_id, email, name, phone, custom } = body

    if (!form_id || !email) {
      return NextResponse.json(
        { error: "form_id and email are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Get form config
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, store_id, list_id, tag, welcome_flow_id, status")
      .eq("id", form_id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    if (form.status !== "active") {
      return NextResponse.json({ error: "Form is not active" }, { status: 400 })
    }

    // 2. Upsert contact
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("id")
      .eq("store_id", form.store_id)
      .eq("email", email)
      .single()

    let contactId: string

    if (existingContact) {
      // Update existing contact
      contactId = existingContact.id
      const updates: Record<string, unknown> = { subscribed: true }
      if (name) updates.first_name = name
      if (phone) updates.phone = phone

      await supabase
        .from("contacts")
        .update(updates)
        .eq("id", contactId)
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from("contacts")
        .insert({
          store_id: form.store_id,
          email,
          first_name: name ?? null,
          phone: phone ?? null,
          subscribed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (contactError || !newContact) {
        return NextResponse.json(
          { error: "Failed to create contact" },
          { status: 500 }
        )
      }
      contactId = newContact.id
    }

    // 3. Add to list if configured
    if (form.list_id) {
      await supabase
        .from("list_members")
        .upsert(
          {
            list_id: form.list_id,
            contact_id: contactId,
            created_at: new Date().toISOString(),
          },
          { onConflict: "list_id,contact_id" }
        )
    }

    // 4. Record submission event
    await supabase.from("events").insert({
      store_id: form.store_id,
      contact_id: contactId,
      type: "form_submission",
      properties: {
        form_id,
        email,
        name: name ?? null,
        phone: phone ?? null,
        custom: custom ?? null,
        tag: form.tag ?? null,
      },
      created_at: new Date().toISOString(),
    })

    // 5. Update form submission count
    try {
      await supabase.rpc("increment_form_submissions", { form_id_param: form_id })
    } catch {
      // If RPC doesn't exist, just continue
    }

    // 6. Trigger welcome flow if configured
    if (form.welcome_flow_id) {
      try {
        await supabase.from("flow_executions").insert({
          flow_id: form.welcome_flow_id,
          contact_id: contactId,
          store_id: form.store_id,
          status: "running",
          current_step: 0,
          created_at: new Date().toISOString(),
        })
      } catch {
        // Flow execution will be picked up by cron
      }
    }

    return NextResponse.json({
      success: true,
      message: "Submission received",
      contact_id: contactId,
    })
  } catch (err) {
    console.error("Form submission error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// CORS headers for cross-origin form submissions
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
