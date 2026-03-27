import { createAdminClient } from "@/lib/supabase/admin";

async function shopifyFetch(
  shop: string,
  accessToken: string,
  path: string
) {
  const response = await fetch(
    `https://${shop}/admin/api/2024-01/${path}`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error(`Shopify API error: ${response.statusText}`);
  return response.json();
}

export async function syncCustomers(
  shop: string,
  accessToken: string,
  storeId: string
) {
  const supabase = createAdminClient();
  let nextPageUrl: string | null = `customers.json?limit=250`;

  while (nextPageUrl) {
    const data = await shopifyFetch(shop, accessToken, nextPageUrl);
    const customers = data.customers || [];

    for (const customer of customers) {
      if (!customer.email) continue;

      await supabase.from("contacts").upsert(
        {
          store_id: storeId,
          email: customer.email.toLowerCase(),
          first_name: customer.first_name || null,
          last_name: customer.last_name || null,
          phone: customer.phone || null,
          shopify_customer_id: String(customer.id),
          total_spent: parseFloat(customer.total_spent || "0"),
          total_orders: customer.orders_count || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,email" }
      );
    }

    // Simple pagination - check if we got a full page
    nextPageUrl =
      customers.length === 250
        ? `customers.json?limit=250&since_id=${customers[customers.length - 1].id}`
        : null;
  }
}

export async function syncProducts(
  shop: string,
  accessToken: string,
  storeId: string
) {
  const supabase = createAdminClient();
  let nextPageUrl: string | null = `products.json?limit=250`;

  while (nextPageUrl) {
    const data = await shopifyFetch(shop, accessToken, nextPageUrl);
    const products = data.products || [];

    for (const product of products) {
      await supabase.from("products").upsert(
        {
          store_id: storeId,
          shopify_product_id: String(product.id),
          title: product.title,
          handle: product.handle,
          image_url: product.image?.src || null,
          price: parseFloat(product.variants?.[0]?.price || "0"),
          compare_at_price: product.variants?.[0]?.compare_at_price
            ? parseFloat(product.variants[0].compare_at_price)
            : null,
          vendor: product.vendor || null,
          product_type: product.product_type || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,shopify_product_id" }
      );
    }

    nextPageUrl =
      products.length === 250
        ? `products.json?limit=250&since_id=${products[products.length - 1].id}`
        : null;
  }
}

export async function syncOrders(
  shop: string,
  accessToken: string,
  storeId: string
) {
  const supabase = createAdminClient();
  let nextPageUrl: string | null = `orders.json?limit=250&status=any`;

  while (nextPageUrl) {
    const data = await shopifyFetch(shop, accessToken, nextPageUrl);
    const orders = data.orders || [];

    for (const order of orders) {
      if (!order.customer?.email) continue;

      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("store_id", storeId)
        .eq("email", order.customer.email.toLowerCase())
        .single();

      if (contact) {
        await supabase.from("events").insert({
          store_id: storeId,
          contact_id: contact.id,
          event_type: "placed_order",
          data: {
            order_id: order.id,
            order_number: order.order_number,
            total_price: order.total_price,
          },
          created_at: order.created_at,
        });
      }
    }

    nextPageUrl =
      orders.length === 250
        ? `orders.json?limit=250&status=any&since_id=${orders[orders.length - 1].id}`
        : null;
  }
}
