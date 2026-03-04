import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const DEFAULT_SUBJECT = "GigWorldToday Weekly Update";
const FROM = "newsletter@gigworldtoday.com";
const TEST_RECIPIENT = "mamie@gigworldtoday.com";

export async function POST(req: Request) {
  /* ── 0. Parse optional body ─────────────────────────── */
  let subject = DEFAULT_SUBJECT;
  let htmlContent: string | null = null;
  let testOnly = false;

  try {
    const body = await req.json();
    if (body.subject) subject = body.subject;
    if (body.content) htmlContent = body.content;
    if (body.testOnly) testOnly = true;
  } catch {
    // No body or invalid JSON — fall back to defaults
  }

  /* ── 1. Validate env ────────────────────────────────── */
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[send-newsletter] RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  /* ── 2. Build HTML ──────────────────────────────────── */
  let html: string;

  if (htmlContent) {
    // Wrap the editor content in a styled email shell
    html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
${htmlContent}
</body></html>`;
  } else {
    // Fall back to the static template file
    try {
      const templatePath = path.join(process.cwd(), "emails", "newsletter.html");
      html = fs.readFileSync(templatePath, "utf-8");
    } catch (err) {
      console.error("[send-newsletter] Failed to load template:", err);
      return NextResponse.json(
        { error: "Newsletter template not found and no content provided" },
        { status: 500 }
      );
    }
  }

  /* ── 3. Determine recipients ─────────────────────────── */
  const resend = new Resend(apiKey);
  const results: { email: string; status: "sent" | "failed"; error?: string }[] = [];

  if (testOnly) {
    // Send only to the admin/test address
    try {
      await resend.emails.send({
        from: FROM,
        to: TEST_RECIPIENT,
        subject: `[TEST] ${subject}`,
        html,
      });
      console.log(`[send-newsletter] ✓ Test sent to ${TEST_RECIPIENT}`);
      results.push({ email: TEST_RECIPIENT, status: "sent" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[send-newsletter] ✗ Test failed for ${TEST_RECIPIENT}:`, message);
      results.push({ email: TEST_RECIPIENT, status: "failed", error: message });
    }

    return NextResponse.json({
      message: `Test email ${results[0].status === "sent" ? "sent" : "failed"}`,
      total: 1,
      sent: results[0].status === "sent" ? 1 : 0,
      failed: results[0].status === "failed" ? 1 : 0,
      details: results,
    });
  }

  /* ── 4. Fetch active subscribers from Supabase ──────── */
  const supabase = createServerSupabase();
  const { data: subscribers, error: dbError } = await supabase
    .from("email_subscribers")
    .select("email")
    .neq("status", "unsubscribed");

  if (dbError) {
    console.error("[send-newsletter] Supabase query failed:", dbError);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ message: "No active subscribers found" });
  }

  /* ── 5. Send emails ─────────────────────────────────── */

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: FROM,
        to: sub.email,
        subject,
        html,
      });
      console.log(`[send-newsletter] ✓ Sent to ${sub.email}`);
      results.push({ email: sub.email, status: "sent" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[send-newsletter] ✗ Failed for ${sub.email}:`, message);
      results.push({ email: sub.email, status: "failed", error: message });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(`[send-newsletter] Done — ${sent} sent, ${failed} failed`);

  return NextResponse.json({
    message: `Newsletter sent: ${sent} delivered, ${failed} failed`,
    total: subscribers.length,
    sent,
    failed,
    details: results,
  });
}
