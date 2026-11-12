import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import {
  getMemberAccess,
  MEMBERS_BUCKET,
  RENTAL_BLUEPRINT_FILE,
  RENTAL_BLUEPRINT_SLUG,
} from "@/lib/purchases";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, hasPurchase } = await getMemberAccess(RENTAL_BLUEPRINT_SLUG);

  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!hasPurchase) return NextResponse.json({ error: "Purchase required" }, { status: 403 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase.storage
    .from(MEMBERS_BUCKET)
    .createSignedUrl(RENTAL_BLUEPRINT_FILE, 60, {
      download: "The-No-Car-Gig-Blueprint.pdf",
    });

  if (error || !data?.signedUrl) {
    console.error("[download] signed URL failed:", error);
    return NextResponse.json({ error: "File unavailable" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
