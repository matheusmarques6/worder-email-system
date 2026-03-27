import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const { domainId } = (await request.json()) as { domainId: string }
    if (!domainId) {
      return NextResponse.json({ error: "domainId is required" }, { status: 400 })
    }

    const resend = getResend()
    const { data, error } = await resend.domains.verify(domainId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ domain: data })
  } catch (error) {
    console.error("Verify domain error:", error)
    return NextResponse.json({ error: "Failed to verify domain" }, { status: 500 })
  }
}
