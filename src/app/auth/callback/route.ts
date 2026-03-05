import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { headers: req.headers as any, cookies: cookies() as any }
    );
    await supabase.auth.exchangeCodeForSession(req.url as unknown as string);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
