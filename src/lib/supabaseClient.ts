import { createClient } from "@supabase/supabase-js";

console.log("ENV URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("ENV KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing SUPABASE KEY");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
