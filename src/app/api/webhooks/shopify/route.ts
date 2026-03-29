import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { processEvent } from "@/lib/flows/engine";
import type { SupabaseClient } from "@supabase/supabase-js";

function verifyWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch {
    return false;
  }
}

interface StoreRow {
  id: string;
  shopify_domain: string;
  shopify_access_token: string | null;
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
  line_items: ShopifyLineItem[];
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
  customer?: { id: number; first_name?: string; last_name?: string };
  fulfillments?: Array<{
    tracking_number?: string;
    tracking_url?: string;
    tracking_company?: string;
  }>;
}

interface ShopifyCheckout {
  token: string;
  email?: string;
  phone?: string;
  abandoned_checkout_url?: string;
  total_price: string;
  line_items: ShopifyLineItem[];
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
): Promise<string | undefined> {
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
    return existing.id as string;
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

  return newContact?.id as string | undefined;
}

// ---------------------------------------------------------------------------
// Topic handlers
// ---------------------------------------------------------------------------

async function handleOrderCreate(
  supabase: SupabaseClient,
  storeId: string,
  order: ShopifyOrder
) {
  if (!order.email) return;

  const billing = order.billing_address;
  const contactId = await upsertContact(supabase, storeId, order.email, {
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

  const eventData = {
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
  };

  await supabase.from("events").insert({
    store_id: storeId,
    contact_id: contactId,
    event_type: "placed_order",
    revenue: parseFloat(order.total_price),
    properties: eventData,
  });

  // Update contact metrics
  const { data: contactData } = await supabase
    .from("contacts")
    .select("total_orders, total_spent")
    .eq("id", contactId)
    .single();

  const totalOrders = ((contactData?.total_orders as number) || 0) + 1;
  const totalSpent =
    ((contactData?.total_spent as number) || 0) + parseFloat(order.total_price);

  await supabase
    .from("contacts")
    .update({
      total_orders: totalOrders,
      total_spent: totalSpent,
      avg_order_value: totalSpent / totalOrders,
      last_order_at: new Date().toISOString(),
    })
    .eq("id", contactId);

  // Trigger flow engine
  await processEvent(storeId, "placed_order", contactId, eventData);
}

async function handleOrderFulfilled(
  supabase: SupabaseClient,
  storeId: string,
  order: ShopifyOrder
) {
  if (!order.email) return;

  const contactId = await upsertContact(supabase, storeId, order.email, {
    shopify_customer_id: order.customer?.id,
  });
  if (!contactId) return;

  const fulfillment = order.fulfillments?.[0];
  const eventData = {
    order_id: order.id,
    tracking_number: fulfillment?.tracking_number,
    tracking_url: fulfillment?.tracking_url,
    tracking_company: fulfillment?.tracking_company,
  };

  await supabase.from("events").insert({
    store_id: storeId,
    contact_id: contactId,
    event_type: "order_fulfilled",
    properties: eventData,
  });

  await processEvent(storeId, "order_fulfilled", contactId, eventData);
}

async function handleCheckout(
  supabase: SupabaseClient,
  storeId: string,
  checkout: ShopifyCheckout
) {
  if (!checkout.email) return;

  const contactId = await upsertContact(supabase, storeId, checkout.email, {
    phone: checkout.phone,
    first_name: checkout.customer?.first_name,
    last_name: checkout.customer?.last_name,
    shopify_customer_id: checkout.customer?.id,
  });
  if (!contactId) return;

  const eventData = {
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
  };

  await supabase.from("events").insert({
    store_id: storeId,
    contact_id: contactId,
    event_type: "started_checkout",
    properties: eventData,
  });

  await processEvent(storeId, "started_checkout", contactId, eventData);
}

async function handleCustomer(
  supabase: SupabaseClient,
  storeId: string,
  customer: ShopifyCustomer,
  topic: string
) {
  if (!customer.email) return;

  const addr = customer.default_address;
  const consentEmail =
    customer.email_marketing_consent?.state === "subscribed";

  const contactId = await upsertContact(supabase, storeId, customer.email, {
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

  if (!contactId) return;

  const eventType =
    topic === "customers/create" ? "customer_created" : "customer_updated";

  await supabase.from("events").insert({
    store_id: storeId,
    contact_id: contactId,
    event_type: eventType,
    properties: {
      shopify_customer_id: customer.id,
      email: customer.email,
    },
  });

  await processEvent(storeId, eventType, contactId, {
    shopify_customer_id: customer.id,
    email: customer.email,
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.text();
  const topic = req.headers.get("x-shopify-topic") || "";
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";

  // Verify HMAC signature
  const secret = process.env.SHOPIFY_API_SECRET;
  if (secret && hmacHeader) {
    if (!verifyWebhook(body, hmacHeader, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, shopify_domain, shopify_access_token")
    .eq("shopify_domain", shopDomain)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const storeId = store.id as string;
  const data = JSON.parse(body);

  switch (topic) {
    case "orders/create":
      await handleOrderCreate(supabase, storeId, data as ShopifyOrder);
      break;
    case "orders/fulfilled":
      await handleOrderFulfilled(supabase, storeId, data as ShopifyOrder);
      break;
    case "customers/create":
    case "customers/update":
      await handleCustomer(
        supabase,
        storeId,
        data as ShopifyCustomer,
        topic
      );
      break;
    case "checkouts/create":
      await handleCheckout(supabase, storeId, data as ShopifyCheckout);
      break;
  }

  return NextResponse.json({ success: true });
}
