import { SHOPIFY_API_VERSION } from "./oauth";
import { createAdminClient } from "@/lib/supabase/admin";

interface ShopifyPaginatedResponse<T> {
  [key: string]: T[];
}

interface ShopifyCustomer {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  default_address?: {
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  tags?: string;
  email_marketing_consent?: { state: string };
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status: string;
  images?: Array<{ src: string }>;
  variants?: Array<{ price: string; compare_at_price?: string }>;
}

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  total_price: string;
  created_at: string;
  line_items: Array<{
    product_id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
  }>;
}

interface StoreRecord {
  id: string;
  shopify_domain: string;
  shopify_access_token: string;
}

/**
 * Fetch all pages of a Shopify REST API resource using Link header pagination.
 */
async function shopifyFetch<T>(
  shop: string,
  accessToken: string,
  endpoint: string,
  resourceKey: string
): Promise<T[]> {
  const all: T[] = [];
  let url: string | null = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}?limit=250`;

  while (url) {
    const response: Response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) break;

    const data = (await response.json()) as ShopifyPaginatedResponse<T>;
    all.push(...(data[resourceKey] || []));

    // Parse Link header for pagination
    const linkHeader = response.headers.get("link");
    url = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch) {
        url = nextMatch[1];
      }
    }
  }

  return all;
}

export async function syncCustomers(store: StoreRecord): Promise<number> {
  const customers = await shopifyFetch<ShopifyCustomer>(
    store.shopify_domain,
    store.shopify_access_token,
    "customers.json",
    "customers"
  );

  const supabase = createAdminClient();
  let synced = 0;

  for (const customer of customers) {
    if (!customer.email) continue;

    const addr = customer.default_address;
    const consentEmail =
      customer.email_marketing_consent?.state === "subscribed";

    const { data: existing } = await supabase
      .from("contacts")
      .select("id")
      .eq("store_id", store.id)
      .eq("email", customer.email)
      .single();

    const contactData = {
      store_id: store.id,
      email: customer.email,
      phone: customer.phone,
      first_name: customer.first_name,
      last_name: customer.last_name,
      city: addr?.city,
      state: addr?.province,
      country: addr?.country,
      zip: addr?.zip,
      shopify_customer_id: customer.id,
      source: "shopify" as const,
      tags: customer.tags,
      consent_email: consentEmail,
    };

    if (existing) {
      await supabase.from("contacts").update(contactData).eq("id", existing.id);
    } else {
      await supabase.from("contacts").insert(contactData);
    }
    synced++;
  }

  return synced;
}

export async function syncProducts(store: StoreRecord): Promise<number> {
  const products = await shopifyFetch<ShopifyProduct>(
    store.shopify_domain,
    store.shopify_access_token,
    "products.json",
    "products"
  );

  const supabase = createAdminClient();
  let synced = 0;

  for (const product of products) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("store_id", store.id)
      .eq("shopify_product_id", product.id)
      .single();

    const productData = {
      store_id: store.id,
      shopify_product_id: product.id,
      title: product.title,
      handle: product.handle,
      image_url: product.images?.[0]?.src || null,
      price: product.variants?.[0]?.price
        ? parseFloat(product.variants[0].price)
        : null,
      compare_at_price: product.variants?.[0]?.compare_at_price
        ? parseFloat(product.variants[0].compare_at_price)
        : null,
      vendor: product.vendor,
      product_type: product.product_type,
      tags: product.tags,
      status: product.status,
    };

    if (existing) {
      await supabase.from("products").update(productData).eq("id", existing.id);
    } else {
      await supabase.from("products").insert(productData);
    }
    synced++;
  }

  return synced;
}

export async function syncOrders(store: StoreRecord): Promise<number> {
  const orders = await shopifyFetch<ShopifyOrder>(
    store.shopify_domain,
    store.shopify_access_token,
    "orders.json?status=any",
    "orders"
  );

  const supabase = createAdminClient();
  let synced = 0;

  for (const order of orders) {
    if (!order.email) continue;

    // Find or skip contact
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, total_orders, total_spent")
      .eq("store_id", store.id)
      .eq("email", order.email)
      .single();

    if (!contact) continue;

    // Check if event already exists for this order
    const { data: existingEvent } = await supabase
      .from("events")
      .select("id")
      .eq("store_id", store.id)
      .eq("event_type", "placed_order")
      .eq("properties->>order_id", String(order.id))
      .single();

    if (!existingEvent) {
      await supabase.from("events").insert({
        store_id: store.id,
        contact_id: contact.id,
        event_type: "placed_order",
        revenue: parseFloat(order.total_price),
        properties: {
          order_id: order.id,
          order_number: order.name,
          total: order.total_price,
          items: order.line_items.map((i) => ({
            product_id: i.product_id,
            title: i.title,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      });

      // Update contact metrics
      const totalOrders = ((contact.total_orders as number) || 0) + 1;
      const totalSpent =
        ((contact.total_spent as number) || 0) + parseFloat(order.total_price);

      await supabase
        .from("contacts")
        .update({
          total_orders: totalOrders,
          total_spent: totalSpent,
          avg_order_value: totalSpent / totalOrders,
          last_order_at: order.created_at,
        })
        .eq("id", contact.id);

      synced++;
    }
  }

  return synced;
}
