export function generateAuthUrl(shopDomain: string, storeId: string): string {
  const apiKey = process.env.SHOPIFY_API_KEY!;
  const scopes = process.env.SHOPIFY_SCOPES!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${appUrl}/api/auth/shopify/callback`;

  const sanitizedDomain = shopDomain
    .replace("https://", "")
    .replace("http://", "")
    .replace(/\/$/, "");

  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state: storeId,
  });

  return `https://${sanitizedDomain}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  shopDomain: string,
  code: string
): Promise<string> {
  const response = await fetch(
    `https://${shopDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY!,
        client_secret: process.env.SHOPIFY_API_SECRET!,
        code,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to exchange code: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}
