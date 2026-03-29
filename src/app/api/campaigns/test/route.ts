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
    let senderName = "Worder"
    let replyTo: string | undefined

    // If templateId/campaignId provided, fetch from DB
    if (campaignId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("*, templates(*), stores(*)")
        .eq("id", campaignId)
        .single()

      if (campaign) {
        const tmpl = campaign.templates as Record<string, unknown>
        const store = campaign.stores as Record<string, unknown>
        if (tmpl && !html) emailHtml = (tmpl.html as string) || ""
        if (tmpl && !subject) emailSubject = (tmpl.subject as string) || emailSubject
        emailSubject = (campaign.subject as string) || emailSubject
        if (store) {
          storeName = (store.name as string) || storeName
          senderName = (store.sender_name as string) || storeName
          const domain = store.shopify_domain as string
          if (domain) senderEmail = `noreply@${domain}`
          if (store.sender_email) senderEmail = store.sender_email as string
          if (store.reply_to) replyTo = store.reply_to as string
        }
      }
    } else if (templateId) {
      const { data: tmpl } = await supabase
        .from("templates")
        .select("*, stores(*)")
        .eq("id", templateId)
        .single()

      if (tmpl) {
        if (!html) emailHtml = (tmpl.html as string) || ""
        if (!subject) emailSubject = (tmpl.subject as string) || emailSubject
        const store = tmpl.stores as Record<string, unknown>
        if (store) {
          storeName = (store.name as string) || storeName
          senderName = (store.sender_name as string) || storeName
          const domain = store.shopify_domain as string
          if (domain) senderEmail = `noreply@${domain}`
          if (store.sender_email) senderEmail = store.sender_email as string
          if (store.reply_to) replyTo = store.reply_to as string
        }
      }
    }

    // Apply merge tags with test data
    const mergeData = {
      contact: {
        first_name: "Teste",
        last_name: "Usuário",
        email: testEmail as string,
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
      to: testEmail as string,
      from: senderEmail,
      senderName,
      subject: `[TESTE] ${renderedSubject}`,
      html: renderedHtml,
      replyTo,
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
