import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { store_id } = (await req.json()) as { store_id: string };
    const supabase = createAdminClient();

    const { data: store } = await supabase
      .from("stores")
      .select("resend_domain_id")
      .eq("id", store_id)
      .single();

    if (!store?.resend_domain_id) {
      return NextResponse.json({ error: "No domain configured" }, { status: 400 });
    }

    const { data, error } = await getResend().domains.verify(store.resend_domain_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check if verified
    const { data: domainInfo } = await getResend().domains.get(store.resend_domain_id);
    const verified = domainInfo?.status === "verified";

    await supabase
      .from("stores")
      .update({ domain_verified: verified })
      .eq("id", store_id);

    return NextResponse.json({ success: true, verified, status: domainInfo?.status });
  } catch (error) {
    console.error("Domain verify error:", error);
    return NextResponse.json({ error: "Failed to verify domain" }, { status: 500 });
  }
}
