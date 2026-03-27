import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { processEvent } from "@/lib/flows/engine";

function verifyHmac(body: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET!;
  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}

async function upsertContact(
  supabase: ReturnType<typeof createAdminClient>,
  storeId: string,
  customerData: Record<string, unknown>
) {
  const email = customerData.email as string;
  if (!email) return null;

  const contactData = {
    store_id: storeId,
    email: email.toLowerCase(),
    first_name: (customerData.first_name as string) || null,
    last_name: (customerData.last_name as string) || null,
    phone: (customerData.phone as string) || null,
    shopify_customer_id: String(customerData.id),
    updated_at: new Date().toISOString(),
  };

  const { data } = await supabase
    .from("contacts")
    .upsert(contactData, {
      onConflict: "store_id,email",
    })
    .select("id")
    .single();

  return data?.id || null;
}

async function createEvent(
  supabase: ReturnType<typeof createAdminClient>,
  storeId: string,
  contactId: string,
  eventType: string,
  data: Record<string, unknown> = {}
) {
  await supabase.from("events").insert({
    store_id: storeId,
    contact_id: contactId,
    event_type: eventType,
    data,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  const storeId = request.nextUrl.searchParams.get("store_id");

  if (!hmacHeader || !verifyHmac(body, hmacHeader)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  if (!topic || !storeId) {
    return NextResponse.json(
      { error: "Missing topic or store_id" },
      { status: 400 }
    );
  }

  const payload = JSON.parse(body);
  const supabase = createAdminClient();

  switch (topic) {
    case "orders/create":
    case "orders/paid": {
      const customer = payload.customer as Record<string, unknown> | undefined;
      if (customer) {
        const contactId = await upsertContact(supabase, storeId, customer);
        if (contactId) {
          const eventType =
            topic === "orders/create" ? "placed_order" : "order_paid";
          const eventProperties = {
            order_id: payload.id,
            order_number: payload.order_number,
            total_price: payload.total_price,
          };
          await createEvent(supabase, storeId, contactId, eventType, eventProperties);
          await processEvent(storeId, eventType, contactId, eventProperties);

          // Update contact metrics
          await supabase.rpc("increment_contact_metrics", {
            p_contact_id: contactId,
            p_order_total: parseFloat(payload.total_price || "0"),
          }).then(async (rpcResult) => {
            if (rpcResult.error) {
              const { data: currentContact } = await supabase
                .from("contacts")
                .select("total_orders, total_spent")
                .eq("id", contactId)
                .single();
              await supabase
                .from("contacts")
                .update({
                  total_orders: ((currentContact?.total_orders as number) ?? 0) + 1,
                  total_spent: ((currentContact?.total_spent as number) ?? 0) + parseFloat(payload.total_price || "0"),
                  last_order_at: new Date().toISOString(),
                })
                .eq("id", contactId);
            }
          });
        }
      }
      break;
    }

    case "orders/fulfilled": {
      const customer = payload.customer as Record<string, unknown> | undefined;
      if (customer) {
        const contactId = await upsertContact(supabase, storeId, customer);
        if (contactId) {
          const fulfilledProps = {
            order_id: payload.id,
            order_number: payload.order_number,
          };
          await createEvent(supabase, storeId, contactId, "order_fulfilled", fulfilledProps);
          await processEvent(storeId, "order_fulfilled", contactId, fulfilledProps);
        }
      }
      break;
    }

    case "orders/cancelled": {
      const customer = payload.customer as Record<string, unknown> | undefined;
      if (customer) {
        const contactId = await upsertContact(supabase, storeId, customer);
        if (contactId) {
          const cancelledProps = {
            order_id: payload.id,
            order_number: payload.order_number,
          };
          await createEvent(supabase, storeId, contactId, "order_cancelled", cancelledProps);
          await processEvent(storeId, "order_cancelled", contactId, cancelledProps);
        }
      }
      break;
    }

    case "checkouts/create":
    case "checkouts/update": {
      if (payload.email) {
        const contactId = await upsertContact(supabase, storeId, {
          email: payload.email,
          first_name: payload.billing_address?.first_name,
          last_name: payload.billing_address?.last_name,
          phone: payload.billing_address?.phone,
          id: payload.customer?.id,
        });
        if (contactId) {
          const checkoutProps = {
            checkout_id: payload.id,
            checkout_token: payload.token,
            total_price: payload.total_price,
            abandoned_checkout_url: payload.abandoned_checkout_url,
          };
          await createEvent(supabase, storeId, contactId, "started_checkout", checkoutProps);
          await processEvent(storeId, "started_checkout", contactId, checkoutProps);
        }
      }
      break;
    }

    case "customers/create":
    case "customers/update": {
      await upsertContact(supabase, storeId, payload);
      break;
    }

    case "products/update": {
      const productData = {
        store_id: storeId,
        shopify_product_id: String(payload.id),
        title: payload.title,
        handle: payload.handle,
        image_url: payload.image?.src || null,
        price: parseFloat(payload.variants?.[0]?.price || "0"),
        compare_at_price: payload.variants?.[0]?.compare_at_price
          ? parseFloat(payload.variants[0].compare_at_price)
          : null,
        vendor: payload.vendor || null,
        product_type: payload.product_type || null,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("products")
        .upsert(productData, { onConflict: "store_id,shopify_product_id" });
      break;
    }

    case "refunds/create": {
      const orderId = payload.order_id;
      if (orderId) {
        // Find contact via order
        const { data: events } = await supabase
          .from("events")
          .select("contact_id")
          .eq("store_id", storeId)
          .eq("event_type", "placed_order")
          .eq("data->>order_id", String(orderId))
          .limit(1);

        if (events?.[0]?.contact_id) {
          const refundProps = {
            refund_id: payload.id,
            order_id: orderId,
          };
          await createEvent(
            supabase,
            storeId,
            events[0].contact_id,
            "refund_created",
            refundProps
          );
          await processEvent(storeId, "refund_created", events[0].contact_id, refundProps);
        }
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
