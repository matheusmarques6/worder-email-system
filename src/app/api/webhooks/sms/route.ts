import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;

    console.log(`SMS status update: ${messageSid} -> ${messageStatus}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
