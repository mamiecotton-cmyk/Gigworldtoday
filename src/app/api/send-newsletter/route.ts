import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const SUBJECT = "GigWorldToday Weekly Update";
const FROM = "newsletter@gigworldtoday.com";

export async function POST() {
  /* ── 1. Validate env ────────────────────────────────── */
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[send-newsletter] RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  /* ── 2. Load HTML template ──────────────────────────── */
  let html: string;
  try {
    const templatePath = path.join(process.cwd(), "emails", "newsletter.html");
    html = fs.readFileSync(templatePath, "utf-8");
  } catch (err) {
    console.error("[send-newsletter] Failed to load template:", err);
    return NextResponse.json(
      { error: "Newsletter template not found" },
      { status: 500 }
    );
  }

  /* ── 3. Fetch active subscribers from Supabase ──────── */
  const supabase = createServerSupabase();
  const { data: subscribers, error: dbError } = await supabase
    .from("email_subscribers")
    .select("email")
    .eq("status", "active");

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

  /* ── 4. Send emails ────────────────────────────────── */
  const resend = new Resend(apiKey);
  const results: { email: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: FROM,
        to: sub.email,
        subject: SUBJECT,
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
