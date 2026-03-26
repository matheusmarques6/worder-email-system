import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendEmailParams {
  to: string;
  from: string;
  senderName: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendEmailResult {
  id?: string;
  error?: string;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const resend = getResend();

  try {
    const { data, error } = await resend.emails.send({
      from: `${params.senderName} <${params.from}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) {
      return { error: error.message };
    }

    return { id: data?.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

interface BatchEmail {
  to: string;
  from: string;
  senderName: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendBatch(
  emails: BatchEmail[]
): Promise<SendEmailResult[]> {
  const resend = getResend();

  try {
    const { data, error } = await resend.batch.send(
      emails.map((e) => ({
        from: `${e.senderName} <${e.from}>`,
        to: [e.to],
        subject: e.subject,
        html: e.html,
        replyTo: e.replyTo,
      }))
    );

    if (error) {
      return emails.map(() => ({ error: error.message }));
    }

    return (data?.data || []).map((d) => ({ id: d.id }));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return emails.map(() => ({ error: errorMsg }));
  }
}
