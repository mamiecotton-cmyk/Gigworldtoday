import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { destination_url, link_type, label, source_page } = await req.json();

    if (!destination_url || !link_type) {
      return NextResponse.json(
        { error: "destination_url and link_type are required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from("outbound_clicks").insert({
      destination_url,
      link_type,
      label: label || null,
      source_page: source_page || null,
    });

    if (error) {
      console.error("Failed to log outbound click:", error);
      return NextResponse.json({ error: "Failed to log click" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("track-click error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
