import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { isUuid } from "@/lib/unsubscribe";

// Handles both the confirm button on /unsubscribe and Gmail/Yahoo one-click unsubscribe.
export async function POST(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("email_subscribers")
    .update({ status: "unsubscribed" })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[unsubscribe] Supabase update failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
