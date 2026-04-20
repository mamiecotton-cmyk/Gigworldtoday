"use client";

import { useState } from "react";

interface Props {
  articleId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
}

function buildEmailHtml(
  title: string,
  slug: string,
  excerpt: string | null | undefined,
  featuredImage: string | null | undefined
): string {
  const articleUrl = `https://www.gigworldtoday.com/blog/${slug}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A1A2E,#0f3460);padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="https://www.gigworldtoday.com/gigsidekick-avatar.png" alt="GigSidekick" width="52" height="52" style="border-radius:50%;display:inline-block;vertical-align:middle;" />
                  <span style="display:inline-block;vertical-align:middle;margin-left:12px;font-size:20px;font-weight:700;color:#ffffff;">GigWorldToday</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#00C9B1,#F97316);"></td>
        </tr>

        <!-- Featured image -->
        ${featuredImage ? `
        <tr>
          <td style="padding:0;">
            <img src="${featuredImage}" alt="${title}" width="600" style="width:100%;max-width:600px;display:block;object-fit:cover;max-height:280px;" />
          </td>
        </tr>
        ` : ""}

        <!-- Content -->
        <tr>
          <td style="padding:36px 36px 24px;">

            <!-- Category label -->
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#00C9B1;">New from GigWorldToday</p>

            <!-- Title -->
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A2E;line-height:1.3;">${title}</h1>

            <!-- Excerpt -->
            ${excerpt ? `<p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">${excerpt}</p>` : ""}

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#F97316;border-radius:8px;">
                  <a href="${articleUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                    Read the Full Article →
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 36px;">
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 36px 32px;">
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.6;">
              You're receiving this because you subscribed to GigWorldToday updates.
            </p>
            <p style="margin:0;font-size:13px;color:#9ca3af;">
              <a href="https://www.gigworldtoday.com" style="color:#00C9B1;text-decoration:none;">GigWorldToday.com</a>
              &nbsp;·&nbsp;
              Built by a driver, for drivers.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
  `.trim();
}

export default function SendNewsletterButton({
  title,
  slug,
  excerpt,
  featuredImage,
}: Props) {
  const [testSending, setTestSending] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subject = title;
  const html = buildEmailHtml(title, slug, excerpt, featuredImage);

  const send = async (testOnly: boolean) => {
    setResult(null);
    setError(null);

    if (!testOnly) {
      const confirmText = prompt(
        `This will send to all active subscribers.\n\nType SEND to confirm:`
      );
      if (confirmText !== "SEND") return;
    }

    testOnly ? setTestSending(true) : setSending(true);

    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content: html, testOnly }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send");
      } else {
        setResult(data.message);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSending(false);
      setTestSending(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6 space-y-3">
      <p className="font-semibold text-gray-800">Send as Newsletter</p>
      <p className="text-sm text-gray-500">
        Sends this article as an email to your subscribers. Always test first.
      </p>

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => send(true)}
          disabled={testSending || sending}
          className="px-4 py-2 rounded text-sm font-medium border border-teal-500 text-teal-600 hover:bg-teal-50 disabled:opacity-50 transition-all"
        >
          {testSending ? "Sending test..." : "📧 Send Test Email"}
        </button>

        <button
          type="button"
          onClick={() => send(false)}
          disabled={testSending || sending}
          className="px-4 py-2 rounded text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-all"
        >
          {sending ? "Sending..." : "🚀 Send to All Subscribers"}
        </button>
      </div>

      {result && (
        <p className="text-sm text-green-600 font-medium">✅ {result}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 font-medium">❌ {error}</p>
      )}
    </div>
  );
}
