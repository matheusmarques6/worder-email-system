import { Resend } from "resend"

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

interface SendEmailParams {
  from: string
  to: string
  subject: string
  html: string
  tags?: Array<{ name: string; value: string }>
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      tags: params.tags,
      replyTo: params.replyTo,
    })

    if (error || !data) {
      return { success: false, error: error?.message ?? "Unknown error" }
    }

    return { success: true, messageId: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { success: false, error: message }
  }
}
