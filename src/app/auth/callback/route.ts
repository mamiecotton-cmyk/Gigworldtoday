import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

/**
 * Supabase redirects here after a successful OAuth login.
 * Exchange the `code` query-param for a session, then send
 * the user to the homepage (or wherever `next` points).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
