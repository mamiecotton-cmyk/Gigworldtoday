import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from("email_subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
