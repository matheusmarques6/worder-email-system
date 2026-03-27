import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface SendEmailParams {
  to: string;
  from: string;
  senderName: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export async function sendEmail({
  to,
  from,
  senderName,
  subject,
  html,
  replyTo,
  tags,
}: SendEmailParams): Promise<{ id?: string; error?: string }> {
  const { data, error } = await getResend().emails.send({
    from: `${senderName} <${from}>`,
    to: [to],
    subject,
    html,
    replyTo,
    tags: tags
      ? Object.entries(tags).map(([name, value]) => ({ name, value }))
      : undefined,
  });

  if (error) {
    return { error: error.message };
  }

  return { id: data?.id };
}
