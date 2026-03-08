import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { answer, gig_type, feedback } = await req.json();

    if (!answer) {
      return NextResponse.json({ error: "answer is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from("site_feedback").insert({
      answer,
      gig_type: gig_type || null,
      feedback: feedback || null,
    });

    if (error) {
      console.error("Failed to insert feedback:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/feedback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
