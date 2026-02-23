import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies().get(name)?.value,
        set: (name, value, options) => cookies().set(name, value, options),
        remove: (name, options) => cookies().set(name, "", { ...options, maxAge: -1 }),
      },
    }
  );
}
