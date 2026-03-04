import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

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
          await fetch("/api/send-welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

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

  // If inserted successfully, send welcome email only if not already sent
  try {
    if (!inserted.welcome_email_sent) {
      await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

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
