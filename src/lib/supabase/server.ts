import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const all = cookieStore.getAll ? cookieStore.getAll() : [];
          return Array.isArray(all) ? all.map((c: any) => ({ name: c.name, value: c.value })) : [];
        },
        setAll: (cookiesArr: any[]) => {
          if (!Array.isArray(cookiesArr)) return;
          cookiesArr.forEach(c => {
            cookieStore.set(c.name, c.value, c.options || {});
          });
        },
      },
    }
  );
}
