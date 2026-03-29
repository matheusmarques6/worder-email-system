import { NextRequest, NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/shopify/oauth";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  if (!shop) {
    return NextResponse.json(
      { error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  const authUrl = generateAuthUrl(shop);
  return NextResponse.redirect(authUrl);
}
