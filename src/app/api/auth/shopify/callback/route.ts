import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForToken } from "@/lib/shopify/oauth";
import { registerWebhooks } from "@/lib/shopify/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const state = searchParams.get("state"); // store_id

  if (!code || !shop || !state) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const shopDomain = shop
      .replace("https://", "")
      .replace("http://", "")
      .replace(/\/$/, "");

    const accessToken = await exchangeCodeForToken(shopDomain, code);

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("stores")
      .update({
        shopify_domain: shopDomain,
        shopify_access_token: accessToken,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state);

    if (updateError) {
      throw new Error(`Failed to update store: ${updateError.message}`);
    }

    await registerWebhooks(shopDomain, accessToken, state);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?success=true`
    );
  } catch (error) {
    console.error("Shopify OAuth callback error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=oauth_failed`
    );
  }
}
