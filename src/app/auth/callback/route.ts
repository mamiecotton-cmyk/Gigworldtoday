import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Supabase redirects here after a successful OAuth login.
 * Exchange the incoming request (which contains the provider code/state)
 * for a session and let the helper set the auth cookies.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";

  try {
    const supabase = createRouteHandlerClient({ cookies });
    // Pass the full request URL so the helper can extract code/state and
    // set the session cookies on the response.
    await supabase.auth.exchangeCodeForSession(request.url as unknown as string);
  } catch (err) {
    // swallow — we'll still redirect the user back to the app
    // but you can log the error server-side if needed
    console.error('OAuth callback error:', err);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
