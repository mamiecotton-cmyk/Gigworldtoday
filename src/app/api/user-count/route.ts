import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = createServerSupabase();

  // Use the admin API to list users — requires service role key
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });

  if (error) {
    console.error("[user-count] Failed to count users:", error.message);
    return NextResponse.json({ count: 0 });
  }

  // The total is available from the response
  const count = data?.total ?? data?.users?.length ?? 0;

  return NextResponse.json({ count });
}
