import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCustomers, syncProducts, syncOrders } from "@/lib/shopify/sync";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { store_id?: string };
    const storeId = body.store_id;

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

    const customers = await syncCustomers(store as {
      id: string;
      shopify_domain: string;
      shopify_access_token: string;
    });
    const products = await syncProducts(store as {
      id: string;
      shopify_domain: string;
      shopify_access_token: string;
    });
    const orders = await syncOrders(store as {
      id: string;
      shopify_domain: string;
      shopify_access_token: string;
    });

    return NextResponse.json({
      success: true,
      synced: { customers, products, orders },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
