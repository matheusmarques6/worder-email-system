/**
 * Render merge tags in HTML content
 * Supports {{tag}} and {{tag|fallback}} syntax
 */
export function renderMergeTags(
  html: string,
  data: Record<string, string>
): string {
  return html.replace(
    /\{\{(\w+)(?:\|([^}]*))?\}\}/g,
    (_match, tag: string, fallback?: string) => {
      return data[tag] || fallback || "";
    }
  );
}

/**
 * Rewrite all <a href="..."> URLs for click tracking
 * Skips mailto: and # links
 */
export function rewriteUrlsForTracking(
  html: string,
  emailSendId: string,
  baseUrl: string
): string {
  return html.replace(
    /(<a\s[^>]*href=["'])([^"']+)(["'][^>]*>)/gi,
    (_match, prefix: string, url: string, suffix: string) => {
      if (
        url.startsWith("mailto:") ||
        url.startsWith("#") ||
        url.startsWith("{{")
      ) {
        return `${prefix}${url}${suffix}`;
      }
      const trackUrl = `${baseUrl}/api/t/c/${emailSendId}?url=${encodeURIComponent(url)}`;
      return `${prefix}${trackUrl}${suffix}`;
    }
  );
}

/**
 * Inject a 1x1 transparent pixel for open tracking
 */
export function injectOpenPixel(
  html: string,
  emailSendId: string,
  baseUrl: string
): string {
  const pixel = `<img src="${baseUrl}/api/t/o/${emailSendId}" width="1" height="1" style="display:none" alt="" />`;
  if (html.includes("</body>")) {
    return html.replace("</body>", `${pixel}</body>`);
  }
  return html + pixel;
}

/**
 * Add unsubscribe link if not already present
 */
export function addUnsubscribeLink(
  html: string,
  emailSendId: string,
  baseUrl: string
): string {
  if (html.toLowerCase().includes("unsubscribe")) {
    return html;
  }
  const link = `<div style="text-align:center;padding:20px;font-size:12px;color:#999;"><a href="${baseUrl}/api/unsubscribe/${emailSendId}" style="color:#999;text-decoration:underline;">Descadastrar</a></div>`;
  if (html.includes("</body>")) {
    return html.replace("</body>", `${link}</body>`);
  }
  return html + link;
}

/**
 * Full pipeline: merge tags → tracking URLs → open pixel → unsubscribe
 */
export function prepareEmailHtml(
  html: string,
  contact: { email: string; first_name?: string | null; last_name?: string | null; phone?: string | null },
  store: { name: string; shopify_domain?: string | null },
  emailSendId: string,
  eventData?: Record<string, string>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const data: Record<string, string> = {
    email: contact.email,
    first_name: contact.first_name || "",
    last_name: contact.last_name || "",
    phone: contact.phone || "",
    store_name: store.name,
    store_url: store.shopify_domain
      ? `https://${store.shopify_domain}`
      : "",
    unsubscribe_url: `${baseUrl}/api/unsubscribe/${emailSendId}`,
    ...eventData,
  };

  let result = renderMergeTags(html, data);
  result = rewriteUrlsForTracking(result, emailSendId, baseUrl);
  result = injectOpenPixel(result, emailSendId, baseUrl);
  result = addUnsubscribeLink(result, emailSendId, baseUrl);

  return result;
}
