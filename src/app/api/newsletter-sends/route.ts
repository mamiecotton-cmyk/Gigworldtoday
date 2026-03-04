import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

/** GET — list all sent newsletters (newest first) */
export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("newsletter_sends")
    .select("*")
    .order("sent_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sends: data });
}
