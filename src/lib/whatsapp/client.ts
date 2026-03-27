interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

const WA_API_BASE = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppText(
  phone: string,
  message: string,
  config: WhatsAppConfig
): Promise<WhatsAppResponse | null> {
  try {
    const response = await fetch(
      `${WA_API_BASE}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      console.error("WhatsApp API error:", await response.text());
      return null;
    }

    return (await response.json()) as WhatsAppResponse;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return null;
  }
}

export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  params: string[],
  config: WhatsAppConfig
): Promise<WhatsAppResponse | null> {
  try {
    const components = params.length > 0
      ? [
          {
            type: "body",
            parameters: params.map((p) => ({
              type: "text",
              text: p,
            })),
          },
        ]
      : [];

    const response = await fetch(
      `${WA_API_BASE}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "pt_BR" },
            components,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("WhatsApp template error:", await response.text());
      return null;
    }

    return (await response.json()) as WhatsAppResponse;
  } catch (error) {
    console.error("WhatsApp template send error:", error);
    return null;
  }
}
