import { SHOPIFY_API_VERSION } from "@/lib/shopify/oauth";

const WEBHOOK_TOPICS = [
  "orders/create",
  "orders/fulfilled",
  "customers/create",
  "customers/update",
  "checkouts/create",
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

async function shopifyApiFetch<T>(
  shop: string,
  accessToken: string,
  path: string,
  options?: RequestInit
): Promise<T> {
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
    throw new Error(
      `Shopify API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function registerWebhooks(
  shop: string,
  accessToken: string,
  webhookUrl: string
): Promise<void> {
  // Get existing webhooks
  const { webhooks: existing } = await shopifyApiFetch<WebhookListResponse>(
    shop,
    accessToken,
    "/webhooks.json"
  );

  // Delete duplicates pointing to our URL or matching our topics
  for (const webhook of existing) {
    if (
      webhook.address === webhookUrl ||
      WEBHOOK_TOPICS.includes(webhook.topic)
    ) {
      await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks/${webhook.id}.json`,
        {
          method: "DELETE",
          headers: { "X-Shopify-Access-Token": accessToken },
        }
      );
    }
  }

  // Register new webhooks for all topics
  for (const topic of WEBHOOK_TOPICS) {
    await shopifyApiFetch<WebhookCreateResponse>(
      shop,
      accessToken,
      "/webhooks.json",
      {
        method: "POST",
        body: JSON.stringify({
          webhook: {
            topic,
            address: webhookUrl,
            format: "json",
          },
        }),
      }
    );
  }
}
