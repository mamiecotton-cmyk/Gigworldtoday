import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { rows } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows to save" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    // Verify the token resolves to a user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Force user_id from token (don't trust client)
    const safeRows = rows.map((r: any) => ({
        user_id: user.id,
        platform_id: r.platform_id,
        platform_name: r.platform_name,
        date: r.date,
        base_pay: Number(r.base_pay) || 0,
        tips: Number(r.tips) || 0,
      adjustments: Number(r.adjustments) || 0,
      bonuses: Number(r.bonuses) || 0,
    }));

    return NextResponse.json({ ok: true, inserted: safeRows.length });
  } catch (err) {
    console.error("earnings-log route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
