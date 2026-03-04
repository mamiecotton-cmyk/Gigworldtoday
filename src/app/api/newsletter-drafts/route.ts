import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

/** GET — list all drafts (newest first) */
export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("newsletter_drafts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ drafts: data });
}

/** POST — create or update a draft */
export async function POST(req: Request) {
  const { id, subject, content } = await req.json();
  const supabase = createServerSupabase();

  if (id) {
    // Update existing draft
    const { data, error } = await supabase
      .from("newsletter_drafts")
      .update({ subject, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ draft: data });
  }

  // Create new draft
  const { data, error } = await supabase
    .from("newsletter_drafts")
    .insert({ subject, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draft: data });
}

/** DELETE — remove a draft */
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("newsletter_drafts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
