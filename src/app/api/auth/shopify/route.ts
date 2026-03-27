import { NextRequest, NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/shopify/oauth";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const storeId = req.nextUrl.searchParams.get("store_id");

  if (!shop || !storeId) {
    return NextResponse.json(
      { error: "Missing shop or store_id parameter" },
      { status: 400 }
    );
  }

  const authUrl = generateAuthUrl(shop, storeId);
  return NextResponse.redirect(authUrl);
}
