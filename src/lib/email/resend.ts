import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { data, error } = await resend.emails.send({
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
