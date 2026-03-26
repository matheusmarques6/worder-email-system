const WEBHOOK_TOPICS = [
  "orders/create",
  "orders/paid",
  "orders/fulfilled",
  "orders/cancelled",
  "checkouts/create",
  "checkouts/update",
  "customers/create",
  "customers/update",
  "products/update",
  "refunds/create",
] as const;

interface ShopifyWebhook {
  id: number;
  topic: string;
  address: string;
}

async function shopifyAdminFetch(
  shop: string,
  accessToken: string,
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(
    `https://${shop}/admin/api/2024-01/${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
        ...options.headers,
      },
    }
  );
  return response;
}

export async function registerWebhooks(
  shop: string,
  accessToken: string,
  storeId: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const webhookUrl = `${appUrl}/api/webhooks/shopify`;

  // Get existing webhooks
  const existingRes = await shopifyAdminFetch(
    shop,
    accessToken,
    "webhooks.json"
  );
  const { webhooks: existing } = (await existingRes.json()) as {
    webhooks: ShopifyWebhook[];
  };

  // Delete duplicates for our endpoint
  for (const webhook of existing) {
    if (webhook.address === webhookUrl) {
      await shopifyAdminFetch(
        shop,
        accessToken,
        `webhooks/${webhook.id}.json`,
        { method: "DELETE" }
      );
    }
  }

  // Register new webhooks
  for (const topic of WEBHOOK_TOPICS) {
    await shopifyAdminFetch(shop, accessToken, "webhooks.json", {
      method: "POST",
      body: JSON.stringify({
        webhook: {
          topic,
          address: `${webhookUrl}?store_id=${storeId}`,
          format: "json",
        },
      }),
    });
  }
}
