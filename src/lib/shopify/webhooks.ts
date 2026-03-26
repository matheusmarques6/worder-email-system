import { SHOPIFY_API_VERSION } from "./oauth";

const WEBHOOK_TOPICS = [
  "orders/create",
  "orders/paid",
  "orders/updated",
  "orders/cancelled",
  "orders/fulfilled",
  "checkouts/create",
  "checkouts/update",
  "customers/create",
  "customers/update",
  "products/update",
  "refunds/create",
];

interface ShopifyWebhook {
  id: number;
  topic: string;
  address: string;
}

interface WebhookListResponse {
  webhooks: ShopifyWebhook[];
}

interface WebhookCreateResponse {
  webhook: ShopifyWebhook;
}

async function shopifyFetch<T>(shop: string, accessToken: string, path: string, options?: RequestInit): Promise<T> {
  const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function registerWebhooks(shop: string, accessToken: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const webhookAddress = `${appUrl}/api/webhooks/shopify`;

  // Get existing webhooks
  const { webhooks: existing } = await shopifyFetch<WebhookListResponse>(
    shop,
    accessToken,
    "/webhooks.json"
  );

  // Delete duplicates
  for (const webhook of existing) {
    if (webhook.address === webhookAddress || WEBHOOK_TOPICS.includes(webhook.topic)) {
      await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks/${webhook.id}.json`,
        {
          method: "DELETE",
          headers: { "X-Shopify-Access-Token": accessToken },
        }
      );
    }
  }

  // Register new webhooks
  for (const topic of WEBHOOK_TOPICS) {
    await shopifyFetch<WebhookCreateResponse>(shop, accessToken, "/webhooks.json", {
      method: "POST",
      body: JSON.stringify({
        webhook: {
          topic,
          address: webhookAddress,
          format: "json",
        },
      }),
    });
  }
}
