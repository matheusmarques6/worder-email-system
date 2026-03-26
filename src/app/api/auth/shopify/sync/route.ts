import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCustomers, syncProducts, syncOrders } from "@/lib/shopify/sync";

export async function POST(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("store_id");

  if (!storeId) {
    return NextResponse.json({ error: "Missing store_id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id, shopify_domain, shopify_access_token")
    .eq("id", storeId)
    .single();

  if (!store || !store.shopify_domain || !store.shopify_access_token) {
    return NextResponse.json(
      { error: "Store not found or Shopify not connected" },
      { status: 404 }
    );
  }

  try {
    const customers = await syncCustomers(store);
    const products = await syncProducts(store);
    const orders = await syncOrders(store);

    return NextResponse.json({
      success: true,
      synced: { customers, products, orders },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
