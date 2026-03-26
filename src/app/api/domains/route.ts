import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { domain, store_id } = (await req.json()) as { domain: string; store_id: string };
    const supabase = createAdminClient();

    const { data: domainData, error } = await getResend().domains.create({ name: domain });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("stores")
      .update({
        sending_domain: domain,
        resend_domain_id: domainData?.id,
        domain_verified: false,
      })
      .eq("id", store_id);

    return NextResponse.json({ success: true, domain: domainData });
  } catch (error) {
    console.error("Domain creation error:", error);
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("store_id");
    if (!storeId) {
      return NextResponse.json({ error: "Missing store_id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: store } = await supabase
      .from("stores")
      .select("sending_domain, resend_domain_id, domain_verified")
      .eq("id", storeId)
      .single();

    if (!store?.resend_domain_id) {
      return NextResponse.json({ domain: null });
    }

    const { data: domainData } = await getResend().domains.get(store.resend_domain_id);

    return NextResponse.json({
      domain: {
        name: store.sending_domain,
        verified: store.domain_verified,
        records: domainData?.records || [],
        status: domainData?.status,
      },
    });
  } catch (error) {
    console.error("Domain fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch domain" }, { status: 500 });
  }
}
