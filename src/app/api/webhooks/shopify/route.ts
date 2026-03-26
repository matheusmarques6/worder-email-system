import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseClient } from "@supabase/supabase-js";

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch {
    return false;
  }
}

interface Store {
  id: string;
  shopify_domain: string;
  webhook_secret?: string;
}

interface ShopifyAddress {
  first_name?: string;
  last_name?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}

interface ShopifyLineItem {
  product_id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
}

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  phone?: string;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  total_tax: string;
  cancel_reason?: string;
  line_items: ShopifyLineItem[];
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
  customer?: { id: number; first_name?: string; last_name?: string };
  fulfillments?: Array<{
    tracking_number?: string;
    tracking_url?: string;
    tracking_company?: string;
  }>;
  refunds?: Array<{
    transactions?: Array<{ amount: string }>;
  }>;
}

interface ShopifyCheckout {
  token: string;
  email?: string;
  phone?: string;
  abandoned_checkout_url?: string;
  total_price: string;
  line_items: ShopifyLineItem[];
  billing_address?: ShopifyAddress;
  customer?: { id: number; first_name?: string; last_name?: string };
}

interface ShopifyCustomer {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  default_address?: ShopifyAddress;
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

interface ShopifyRefund {
  order_id: number;
  transactions?: Array<{ amount: string }>;
}

async function upsertContact(
  supabase: SupabaseClient,
  storeId: string,
  email: string,
  data: {
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    shopify_customer_id?: number;
    source?: string;
    tags?: string;
    consent_email?: boolean;
  }
) {
  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("store_id", storeId)
    .eq("email", email)
    .single();

  if (existing) {
    await supabase
      .from("contacts")
      .update({
        phone: data.phone || undefined,
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        zip: data.zip || undefined,
        shopify_customer_id: data.shopify_customer_id || undefined,
        tags: data.tags || undefined,
        consent_email: data.consent_email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data: newContact } = await supabase
    .from("contacts")
    .insert({
      store_id: storeId,
      email,
      phone: data.phone,
      first_name: data.first_name,
      last_name: data.last_name,
      city: data.city,
      state: data.state,
      country: data.country,
      zip: data.zip,
      shopify_customer_id: data.shopify_customer_id,
      source: data.source || "shopify",
      tags: data.tags,
      consent_email: data.consent_email,
    })
    .select("id")
    .single();

  return newContact?.id;
}

async function handleOrderCreate(supabase: SupabaseClient, store: Store, order: ShopifyOrder) {
  if (!order.email) return;

  const billing = order.billing_address;
  const contactId = await upsertContact(supabase, store.id, order.email, {
    phone: order.phone || billing?.phone,
    first_name: order.customer?.first_name || billing?.first_name,
    last_name: order.customer?.last_name || billing?.last_name,
    city: billing?.city,
    state: billing?.province,
    country: billing?.country,
    zip: billing?.zip,
    shopify_customer_id: order.customer?.id,
    source: "shopify",
  });

  if (!contactId) return;

  await supabase.from("events").insert({
    store_id: store.id,
    contact_id: contactId,
    event_type: "placed_order",
    revenue: parseFloat(order.total_price),
    properties: {
      order_id: order.id,
      order_number: order.name,
      total: order.total_price,
      subtotal: order.subtotal_price,
      discount: order.total_discounts,
      tax: order.total_tax,
      items: order.line_items.map((i) => ({
        product_id: i.product_id,
        title: i.title,
        quantity: i.quantity,
        price: i.price,
        sku: i.sku,
      })),
      billing_address: order.billing_address,
      shipping_address: order.shipping_address,
    },
  });

  // Update contact metrics
  const { data: contactData } = await supabase
    .from("contacts")
    .select("total_orders, total_spent")
    .eq("id", contactId)
    .single();

  const totalOrders = (contactData?.total_orders || 0) + 1;
  const totalSpent = (contactData?.total_spent || 0) + parseFloat(order.total_price);

  await supabase
    .from("contacts")
    .update({
      total_orders: totalOrders,
      total_spent: totalSpent,
      avg_order_value: totalSpent / totalOrders,
      last_order_at: new Date().toISOString(),
    })
    .eq("id", contactId);

  // Mark abandoned cart as recovered
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: abandonedEvents } = await supabase
    .from("events")
    .select("id, properties")
    .eq("contact_id", contactId)
    .eq("event_type", "started_checkout")
    .gte("created_at", twentyFourHoursAgo);

  if (abandonedEvents) {
    for (const event of abandonedEvents) {
      await supabase
        .from("events")
        .update({
          properties: { ...((event.properties as Record<string, unknown>) || {}), recovered: true },
        })
        .eq("id", event.id);
    }
  }
}

async function handleOrderPaid(supabase: SupabaseClient, store: Store, order: ShopifyOrder) {
  if (!order.email) return;
  const contactId = await upsertContact(supabase, store.id, order.email, {
    shopify_customer_id: order.customer?.id,
  });
  if (!contactId) return;

  await supabase.from("events").insert({
    store_id: store.id,
    contact_id: contactId,
    event_type: "order_paid",
    properties: { order_id: order.id },
  });
}

async function handleOrderFulfilled(supabase: SupabaseClient, store: Store, order: ShopifyOrder) {
  if (!order.email) return;
  const contactId = await upsertContact(supabase, store.id, order.email, {
    shopify_customer_id: order.customer?.id,
  });
  if (!contactId) return;

  const fulfillment = order.fulfillments?.[0];
  await supabase.from("events").insert({
    store_id: store.id,
    contact_id: contactId,
    event_type: "order_fulfilled",
    properties: {
      order_id: order.id,
      tracking_number: fulfillment?.tracking_number,
      tracking_url: fulfillment?.tracking_url,
      tracking_company: fulfillment?.tracking_company,
    },
  });
}

async function handleOrderCancelled(supabase: SupabaseClient, store: Store, order: ShopifyOrder) {
  if (!order.email) return;
  const contactId = await upsertContact(supabase, store.id, order.email, {
    shopify_customer_id: order.customer?.id,
  });
  if (!contactId) return;

  await supabase.from("events").insert({
    store_id: store.id,
    contact_id: contactId,
    event_type: "order_cancelled",
    properties: { order_id: order.id, cancel_reason: order.cancel_reason },
  });
}

async function handleCheckout(supabase: SupabaseClient, store: Store, checkout: ShopifyCheckout) {
  if (!checkout.email) return;
  const contactId = await upsertContact(supabase, store.id, checkout.email, {
    phone: checkout.phone,
    first_name: checkout.customer?.first_name,
    last_name: checkout.customer?.last_name,
    shopify_customer_id: checkout.customer?.id,
  });
  if (!contactId) return;

  await supabase.from("events").insert({
    store_id: store.id,
    contact_id: contactId,
    event_type: "started_checkout",
    properties: {
      checkout_token: checkout.token,
      abandoned_checkout_url: checkout.abandoned_checkout_url,
      items: checkout.line_items.map((i) => ({
        product_id: i.product_id,
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      total: checkout.total_price,
      email: checkout.email,
    },
  });
}

async function handleCustomer(supabase: SupabaseClient, store: Store, customer: ShopifyCustomer) {
  if (!customer.email) return;
  const addr = customer.default_address;
  const consentEmail = customer.email_marketing_consent?.state === "subscribed";

  await upsertContact(supabase, store.id, customer.email, {
    phone: customer.phone,
    first_name: customer.first_name,
    last_name: customer.last_name,
    city: addr?.city,
    state: addr?.province,
    country: addr?.country,
    zip: addr?.zip,
    shopify_customer_id: customer.id,
    source: "shopify",
    tags: customer.tags,
    consent_email: consentEmail,
  });
}

async function handleProduct(supabase: SupabaseClient, store: Store, product: ShopifyProduct) {
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
    price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : null,
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
}

async function handleRefund(supabase: SupabaseClient, store: Store, refund: ShopifyRefund) {
  const refundAmount = refund.transactions?.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0
  ) || 0;

  await supabase.from("events").insert({
    store_id: store.id,
    event_type: "refund_created",
    properties: {
      order_id: refund.order_id,
      refund_amount: refundAmount,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const topic = req.headers.get("x-shopify-topic") || "";
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const supabase = createAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("shopify_domain", shopDomain)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  if (store.webhook_secret) {
    const sig = req.headers.get("x-shopify-hmac-sha256") || "";
    if (!verifyWebhook(body, sig, store.webhook_secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const data = JSON.parse(body);

  switch (topic) {
    case "orders/create":
      await handleOrderCreate(supabase, store as Store, data as ShopifyOrder);
      break;
    case "orders/paid":
      await handleOrderPaid(supabase, store as Store, data as ShopifyOrder);
      break;
    case "orders/fulfilled":
      await handleOrderFulfilled(supabase, store as Store, data as ShopifyOrder);
      break;
    case "orders/cancelled":
      await handleOrderCancelled(supabase, store as Store, data as ShopifyOrder);
      break;
    case "checkouts/create":
    case "checkouts/update":
      await handleCheckout(supabase, store as Store, data as ShopifyCheckout);
      break;
    case "customers/create":
    case "customers/update":
      await handleCustomer(supabase, store as Store, data as ShopifyCustomer);
      break;
    case "products/update":
      await handleProduct(supabase, store as Store, data as ShopifyProduct);
      break;
    case "refunds/create":
      await handleRefund(supabase, store as Store, data as ShopifyRefund);
      break;
  }

  return NextResponse.json({ success: true });
}
