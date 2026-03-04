import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { Resend } from "resend";

const WELCOME_HTML = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto">
  <h2>Welcome to GigWorldToday</h2>
  <p>Hi <strong>5-Star Gig Worker Community ⭐</strong>,</p>
  <p>Welcome to GigWorldToday — a centralized hub where gig workers discover opportunities and maximize income.</p>
  <p>Our weekly newsletter features short updates including:</p>
  <ul>
    <li>new gig platforms</li>
    <li>deep dives into gig platforms</li>
    <li>tools hand-picked for gig workers</li>
    <li>strategies to maximize gig income</li>
  </ul>
  <p><a href="https://gigworldtoday.com/platforms">Explore Gig Platforms</a></p>
  <p>Keep earning smart and stay 5-Star ⭐</p>
  <p>Mamie<br>Founder, GigWorldToday</p>
</div>`;

async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] RESEND_API_KEY not set — skipping welcome email");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "GigWorldToday <newsletter@gigworldtoday.com>",
    to: email,
    subject: "Welcome to GigWorldToday ⭐",
    html: WELCOME_HTML,
  });
  console.log(`[subscribe] Welcome email sent to ${email}`);
}

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Try to insert the subscriber and return the inserted row
  const { data: inserted, error } = await supabase
    .from("email_subscribers")
    .insert({ email, status: "active", welcome_email_sent: false })
    .select()
    .single();

  if (error) {
    // If the user already exists, fetch the existing row so we can
    // still consider sending the welcome email if it wasn't sent before.
    if (error.code === "23505") {
      const { data: existing, error: fetchErr } = await supabase
        .from("email_subscribers")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
      }

      // If welcome email hasn't been sent yet, send it now and mark column
      if (!existing.welcome_email_sent) {
        try {
          await sendWelcomeEmail(email);
          await supabase
            .from("email_subscribers")
            .update({ welcome_email_sent: true })
            .eq("email", email);
        } catch (err) {
          console.error("Failed to send welcome email for existing subscriber:", err);
        }
      }

      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  // If inserted successfully, send welcome email
  try {
    if (!inserted.welcome_email_sent) {
      await sendWelcomeEmail(email);
      await supabase
        .from("email_subscribers")
        .update({ welcome_email_sent: true })
        .eq("email", email);
    }
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return NextResponse.json({ success: true });
}
