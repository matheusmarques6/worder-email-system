import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/resend"
import { prepareEmailHtml, prepareSubject } from "@/lib/email/render"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail, subject, html, templateId, campaignId } = body

    if (!testEmail) {
      return NextResponse.json({ error: "testEmail is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    let emailHtml = html || ""
    let emailSubject = subject || "Email de teste"
    let storeName = "Worder"
    let senderEmail = "noreply@mail.convertfy.com.br"

    // If templateId provided, fetch template and store
    if (templateId || campaignId) {
      let template: Record<string, unknown> | null = null
      let store: Record<string, unknown> | null = null

      if (campaignId) {
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("*, templates(*), stores(*)")
          .eq("id", campaignId)
          .single()

        if (campaign) {
          template = campaign.templates as Record<string, unknown>
          store = campaign.stores as Record<string, unknown>
          emailSubject = (campaign.subject as string) || emailSubject
        }
      } else if (templateId) {
        const { data: tmpl } = await supabase
          .from("templates")
          .select("*, stores(*)")
          .eq("id", templateId)
          .single()

        if (tmpl) {
          template = tmpl
          store = tmpl.stores as Record<string, unknown>
        }
      }

      if (template && !html) {
        emailHtml = (template.html as string) || ""
      }
      if (template && !subject) {
        emailSubject = (template.subject as string) || emailSubject
      }
      if (store) {
        storeName = (store.name as string) || storeName
        const domain = (store.shopify_domain as string)
        if (domain) senderEmail = `noreply@${domain}`
      }
    }

    // Apply merge tags with test data
    const mergeData = {
      contact: {
        first_name: "Teste",
        last_name: "Usuário",
        email: testEmail,
        phone: "",
      },
      store: {
        name: storeName,
        url: "",
      },
    }

    const renderedHtml = prepareEmailHtml(emailHtml, mergeData)
    const renderedSubject = prepareSubject(emailSubject, mergeData)

    // Send via Resend
    const result = await sendEmail({
      to: testEmail,
      from: senderEmail,
      senderName: storeName,
      subject: `[TESTE] ${renderedSubject}`,
      html: renderedHtml,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Email de teste enviado para ${testEmail}`,
      resendId: result.id,
    })
  } catch (err) {
    console.error("Test email error:", err)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
