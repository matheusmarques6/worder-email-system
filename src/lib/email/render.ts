import type { Contact, Store } from "@/types";

export function renderMergeTags(
  html: string,
  data: Record<string, string | undefined>
): string {
  return html.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (_match, tag, fallback) => {
    const value = data[tag];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
    return fallback || "";
  });
}

export function rewriteUrlsForTracking(
  html: string,
  emailSendId: string,
  baseUrl: string
): string {
  return html.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (match, before, url, after) => {
      // Skip mailto, tel, and anchor links
      if (
        url.startsWith("mailto:") ||
        url.startsWith("tel:") ||
        url.startsWith("#")
      ) {
        return match;
      }
      // Skip tracking URLs (avoid double-wrapping)
      if (url.includes("/api/t/c/")) {
        return match;
      }
      const encodedUrl = encodeURIComponent(url);
      return `<a ${before}href="${baseUrl}/api/t/c/${emailSendId}?url=${encodedUrl}"${after}>`;
    }
  );
}

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

export function addUnsubscribeLink(
  html: string,
  emailSendId: string,
  baseUrl: string
): string {
  // Don't add if already present
  if (html.includes("/api/unsubscribe/")) {
    return html;
  }

  const unsubLink = `
    <div style="text-align:center;padding:20px;font-size:12px;color:#9CA3AF;">
      <a href="${baseUrl}/api/unsubscribe/${emailSendId}" style="color:#9CA3AF;text-decoration:underline;">
        Descadastrar-se
      </a>
    </div>
  `;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${unsubLink}</body>`);
  }
  return html + unsubLink;
}

export function prepareEmailHtml(
  html: string,
  contact: Contact,
  store: Store,
  emailSendId: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const data: Record<string, string | undefined> = {
    first_name: contact.first_name || undefined,
    last_name: contact.last_name || undefined,
    email: contact.email,
    phone: contact.phone || undefined,
    store_name: store.name,
    store_url: store.shopify_domain
      ? `https://${store.shopify_domain}`
      : undefined,
  };

  let result = renderMergeTags(html, data);
  result = rewriteUrlsForTracking(result, emailSendId, baseUrl);
  result = injectOpenPixel(result, emailSendId, baseUrl);
  result = addUnsubscribeLink(result, emailSendId, baseUrl);

  return result;
}
