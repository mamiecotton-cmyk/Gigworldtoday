const SITE_URL = "https://www.gigworldtoday.com";

/** Put this exact text in any newsletter HTML where the unsubscribe link should go. */
export const UNSUBSCRIBE_PLACEHOLDER = "{{UNSUBSCRIBE_URL}}";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);

export const unsubscribeUrl = (subscriberId: string) =>
  `${SITE_URL}/unsubscribe?id=${encodeURIComponent(subscriberId)}`;

export const unsubscribeHeaders = (url: string) => ({
  "List-Unsubscribe": `<${url}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

const FALLBACK_FOOTER = `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">You're receiving this because you subscribed to GigWorldToday. <a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a></p>`;

/** If the HTML has no unsubscribe placeholder, add a simple footer so every email has one. */
export function ensureUnsubscribeFooter(html: string): string {
  if (html.includes(UNSUBSCRIBE_PLACEHOLDER)) return html;
  return html.includes("</body>")
    ? html.replace("</body>", `${FALLBACK_FOOTER}\n</body>`)
    : html + FALLBACK_FOOTER;
}

/** Swap the placeholder for one recipient's real link. */
export const personalizeUnsubscribe = (html: string, url: string) =>
  html.split(UNSUBSCRIBE_PLACEHOLDER).join(url);
