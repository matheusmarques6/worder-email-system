interface SMSConfig {
  provider: "twilio" | "generic";
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

interface SMSResult {
  id: string;
  status: "sent" | "failed" | "skipped";
}

export async function sendSMS(
  phone: string,
  message: string,
  config?: SMSConfig | null
): Promise<SMSResult> {
  if (!config || !config.accountSid || !config.authToken) {
    console.warn("[SMS] SMS não configurado. Mensagem não enviada para:", phone);
    return { id: "", status: "skipped" };
  }

  if (config.provider === "twilio") {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: config.fromNumber || "",
      Body: message,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      console.error("[SMS] Falha ao enviar SMS:", await res.text());
      return { id: "", status: "failed" };
    }

    const data = await res.json();
    return { id: data.sid, status: "sent" };
  }

  console.warn("[SMS] Provider não suportado:", config.provider);
  return { id: "", status: "skipped" };
}
