import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/shopify/oauth";
import { registerWebhooks } from "@/lib/shopify/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const shop = req.nextUrl.searchParams.get("shop");

  if (!code || !shop) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=missing_params", req.url)
    );
  }

  try {
    const accessToken = await exchangeCodeForToken(shop, code);
    const supabase = createAdminClient();

    // Update store with Shopify credentials
    await supabase
      .from("stores")
      .update({
        shopify_domain: shop,
        shopify_access_token: accessToken,
      })
      .eq("shopify_domain", shop);

    // Register webhooks
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`;
    await registerWebhooks(shop, accessToken, webhookUrl);

    return NextResponse.redirect(
      new URL("/settings/integrations?success=true", req.url)
    );
  } catch (error) {
    console.error("Shopify OAuth error:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=oauth_failed", req.url)
    );
  }
}
