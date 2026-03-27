interface SMSResponse {
  id: string;
  status: "sent" | "failed";
}

export async function sendSMS(
  phone: string,
  message: string
): Promise<SMSResponse> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.warn("SMS not configured - Twilio credentials missing");
    return { id: "not_configured", status: "failed" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: fromPhone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error("Twilio SMS error:", await response.text());
      return { id: "", status: "failed" };
    }

    const data = (await response.json()) as { sid: string };
    return { id: data.sid, status: "sent" };
  } catch (error) {
    console.error("SMS send error:", error);
    return { id: "", status: "failed" };
  }
}
