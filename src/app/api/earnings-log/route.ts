import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface EarningsRow {
  user_id: string;
  platform_id: string;
  platform_name: string;
  date: string;
  base_pay: number;
  tips: number;
  total_pay?: number;
}

function createAuthedSupabase(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

function isTotalPaySchemaError(message = "") {
  return /total_pay|generated column|column .* does not exist/i.test(message);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const accessToken = authHeader.replace(/^Bearer\s+/i, "");

    if (!accessToken) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const body = await req.json();
    const rows = Array.isArray(body?.rows) ? (body.rows as EarningsRow[]) : [];

    if (rows.length === 0) {
      return NextResponse.json({ error: "No earnings rows provided" }, { status: 400 });
    }

    const supabase = createAuthedSupabase(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || "Invalid auth token" },
        { status: 401 }
      );
    }

    const sanitizedRows = rows.map((row) => {
      const basePay = Number(row.base_pay) || 0;
      const tips = Number(row.tips) || 0;

      return {
        user_id: user.id,
        platform_id: String(row.platform_id || ""),
        platform_name: String(row.platform_name || ""),
        date: String(row.date || ""),
        base_pay: basePay,
        tips,
      };
    });

    const invalidRow = sanitizedRows.find(
      (row) => !row.platform_id || !row.platform_name || !row.date
    );

    if (invalidRow) {
      return NextResponse.json(
        { error: "Missing platform or date for an earnings row" },
        { status: 400 }
      );
    }

    const rowsWithTotal = sanitizedRows.map((row) => ({
      ...row,
      total_pay: row.base_pay + row.tips,
    }));

    let { error } = await supabase.from("earnings_log").upsert(rowsWithTotal, {
      onConflict: "user_id,platform_id,date",
    });

    if (error && isTotalPaySchemaError(error.message)) {
      console.warn("Retrying earnings API save without total_pay:", error.message);
      ({ error } = await supabase.from("earnings_log").upsert(sanitizedRows, {
        onConflict: "user_id,platform_id,date",
      }));
    }

    if (error) {
      console.error("Earnings API save failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Earnings API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save earnings" },
      { status: 500 }
    );
  }
}
