import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseRouteClient } from "@/lib/supabaseServer";
import { RENTAL_BLUEPRINT_SLUG } from "@/lib/purchases";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gigworldtoday.com";

// GET so a signed-out visitor can be sent through login and land back here.
export async function GET(req: Request) {
  // Keep checkout closed until the full guide is ready (set NEXT_PUBLIC_BLUEPRINT_LIVE=true in Vercel).
  if (process.env.NEXT_PUBLIC_BLUEPRINT_LIVE !== "true") {
    return NextResponse.redirect(new URL("/rental-blueprint", SITE_URL), 303);
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const authClient = await createSupabaseRouteClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    const login = new URL("/login", SITE_URL);
    login.searchParams.set("redirectTo", "/api/checkout");
    return NextResponse.redirect(login, 303);
  }

  const stripe = new Stripe(secret);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 999,
          product_data: {
            name: "The No-Car Gig Blueprint",
            description:
              "How to work multiple gig apps without putting miles on your own car.",
          },
        },
      },
    ],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { product_slug: RENTAL_BLUEPRINT_SLUG, user_id: user.id },
    success_url: `${SITE_URL}/members/rental-blueprint?paid=1`,
    cancel_url: `${SITE_URL}/rental-blueprint`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, 303);
}
