import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function GET() {
  try {
    const resend = getResend()
    const { data, error } = await resend.domains.list()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ domains: data?.data ?? [] })
  } catch (error) {
    console.error("List domains error:", error)
    return NextResponse.json({ error: "Failed to list domains" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { domain } = (await request.json()) as { domain: string }
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    const resend = getResend()
    const { data, error } = await resend.domains.create({ name: domain })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ domain: data })
  } catch (error) {
    console.error("Add domain error:", error)
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 })
  }
}
