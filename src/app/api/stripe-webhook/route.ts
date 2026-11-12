import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature check failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const email = session.customer_details?.email ?? session.customer_email;
      const productSlug = session.metadata?.product_slug;
      const userId = session.client_reference_id ?? session.metadata?.user_id ?? null;

      if (email && productSlug) {
        const supabase = createServerSupabase();
        const { error } = await supabase.from("purchases").upsert(
          {
            user_id: userId,
            email: email.toLowerCase(),
            product_slug: productSlug,
            stripe_session_id: session.id,
            amount_cents: session.amount_total,
          },
          { onConflict: "stripe_session_id" }
        );
        if (error) {
          console.error("[stripe-webhook] failed to record purchase:", error);
          // 500 so Stripe retries
          return NextResponse.json({ error: "Could not record purchase" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
