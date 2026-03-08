"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Feedback = {
  id: string;
  answer: string;
  gig_type: string | null;
  feedback: string | null;
  created_at: string;
};

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data || []) as Feedback[]);
        setLoading(false);
      });
  }, []);

  const total = rows.length;
  const yesCount = rows.filter((r) => r.answer === "Yes").length;
  const exploringCount = rows.filter((r) => r.answer === "Still exploring").length;
  const notYetCount = rows.filter((r) => r.answer === "Not yet").length;

  // Gig type breakdown
  const gigMap = new Map<string, number>();
  rows.forEach((r) => {
    if (r.gig_type) gigMap.set(r.gig_type, (gigMap.get(r.gig_type) || 0) + 1);
  });
  const gigStats = Array.from(gigMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this response?")) return;
    await supabase.from("site_feedback").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = async () => {
    const confirmText = prompt("This will delete ALL survey responses.\n\nType DELETE to confirm:");
    if (confirmText !== "DELETE") return;
    await supabase.from("site_feedback").delete().neq("id", "");
    setRows([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exit Survey Feedback</h1>
        <div className="flex gap-3 items-center">
          {rows.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              Clear All
            </button>
          )}
          <Link href="/admin" className="text-sm text-gray-500 hover:text-black transition">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          {/* Answer Breakdown */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">Total Responses</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">👍 Yes</p>
              <p className="text-2xl font-bold">{yesCount}</p>
              <p className="text-xs text-gray-400 mt-1">{pct(yesCount)}%</p>
            </div>
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">👀 Still exploring</p>
              <p className="text-2xl font-bold">{exploringCount}</p>
              <p className="text-xs text-gray-400 mt-1">{pct(exploringCount)}%</p>
            </div>
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">🤔 Not yet</p>
              <p className="text-2xl font-bold">{notYetCount}</p>
              <p className="text-xs text-gray-400 mt-1">{pct(notYetCount)}%</p>
            </div>
          </div>

          {/* Answer bar */}
          {total > 0 && (
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Response Distribution</h2>
              <div className="flex rounded-full overflow-hidden h-4">
                {yesCount > 0 && (
                  <div className="bg-teal-500 h-full" style={{ width: `${pct(yesCount)}%` }} title={`Yes: ${pct(yesCount)}%`} />
                )}
                {exploringCount > 0 && (
                  <div className="bg-orange-400 h-full" style={{ width: `${pct(exploringCount)}%` }} title={`Still exploring: ${pct(exploringCount)}%`} />
                )}
                {notYetCount > 0 && (
                  <div className="bg-gray-300 h-full" style={{ width: `${pct(notYetCount)}%` }} title={`Not yet: ${pct(notYetCount)}%`} />
                )}
              </div>
              <div className="flex gap-6 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-500 inline-block" /> Yes ({pct(yesCount)}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> Still exploring ({pct(exploringCount)}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Not yet ({pct(notYetCount)}%)</span>
              </div>
            </div>
          )}

          {/* Gig Type Breakdown */}
          {gigStats.length > 0 && (
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Interest by Gig Type</h2>
              <div className="space-y-3">
                {gigStats.map((g) => (
                  <div key={g.type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{g.type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-teal-500 h-2.5 rounded-full"
                          style={{ width: `${Math.round((g.count / total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{g.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent written feedback */}
          {rows.some((r) => r.feedback) && (
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Written Suggestions</h2>
              <div className="space-y-3">
                  {rows
                  .filter((r) => r.feedback)
                  .slice(0, 20)
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start gap-3">
                      <div>
                        <p className="text-sm text-gray-800">{r.feedback}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.created_at).toLocaleDateString()} · {r.answer} · {r.gig_type || "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
