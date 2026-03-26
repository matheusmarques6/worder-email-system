import { NextResponse, type NextRequest } from "next/server";
import { generateAuthUrl } from "@/lib/shopify/oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get("shop");
  const storeId = searchParams.get("store_id");

  if (!shop || !storeId) {
    return NextResponse.json(
      { error: "Missing shop or store_id parameter" },
      { status: 400 }
    );
  }

  const authUrl = generateAuthUrl(shop, storeId);
  return NextResponse.redirect(authUrl);
}
