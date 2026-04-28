"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface EarningsData {
  id?: string;
  platform_name: string;
  base_pay: number;
  tips: number;
  total_pay?: number;
  date: string;
}

export default function EarningsDashboard() {
  const [data, setData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "month" | "year">("week");
  const [drillPlatform, setDrillPlatform] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(new Error("Earnings took too long to load. Please try again."));
        }, 10000);
      });

      const { data: { user } } = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise,
      ]);

      if (!user) {
        setError("Please sign in again to view earnings.");
        setData([]);
        return;
      }

      const now = new Date();
      let startDate: string;

      if (view === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split("T")[0];
      } else if (view === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      } else {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      }

      const { data: earnings, error: earningsError } = await Promise.race([
        supabase
          .from("earnings_log")
          .select("id, platform_name, base_pay, tips, total_pay, date")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .order("date", { ascending: false }),
        timeoutPromise,
      ]);

      if (earningsError) {
        setError(earningsError.message || "Could not load earnings.");
        setData([]);
        return;
      }

      setData(earnings || []);
    } catch (err) {
      console.error("Fetch earnings failed:", err);
      setError(err instanceof Error ? err.message : "Could not load earnings.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleDelete = async (id: string) => {
    const { error: deleteErr } = await supabase
      .from("earnings_log")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      setError(deleteErr.message);
      return;
    }

    setConfirmDeleteId(null);
    await fetchEarnings();
  };

  // Calculations
  const entryTotal = (entry: EarningsData) =>
    entry.total_pay ?? (entry.base_pay || 0) + (entry.tips || 0);

  const totalBase = data.reduce((s, e) => s + (e.base_pay || 0), 0);
  const totalTips = data.reduce((s, e) => s + (e.tips || 0), 0);
  const totalEarnings = totalBase + totalTips;
  const taxSetAside = totalEarnings * 0.25;
  const takeHome = totalEarnings - taxSetAside;
  const tipPercentage = totalEarnings > 0 ? (totalTips / totalEarnings) * 100 : 0;

  const byPlatform = data.reduce((acc, e) => {
    if (!acc[e.platform_name]) {
      acc[e.platform_name] = { base: 0, tips: 0, total: 0 };
    }
    acc[e.platform_name].base += e.base_pay || 0;
    acc[e.platform_name].tips += e.tips || 0;
    acc[e.platform_name].total += entryTotal(e);
    return acc;
  }, {} as Record<string, { base: number; tips: number; total: number }>);

  const platformRanking = Object.entries(byPlatform)
    .sort((a, b) => b[1].total - a[1].total);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayEarnings = data
      .filter((e) => e.date === dateStr)
      .reduce((s, e) => s + entryTotal(e), 0);
    return {
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: dayEarnings,
    };
  });

  const maxDay = Math.max(...last7Days.map((d) => d.amount), 1);

  // Entries for drill-down
  const drillEntries = drillPlatform
    ? data
        .filter((e) => e.platform_name === drillPlatform)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["week", "month", "year"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                view === v
                  ? "bg-white text-[#1A1A2E] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {v === "week" ? "This Week" : v === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>

        {data.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">No earnings logged yet for this period.</p>
            <p className="text-xs mt-1">Start logging your daily earnings above.</p>
          </div>
        ) : (
          <>
            {/* Main stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] rounded-2xl p-4 col-span-2">
                <p className="text-xs text-white/50 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <p className="text-xs text-white/40">Base Pay</p>
                    <p className="text-sm font-semibold text-teal-400">${totalBase.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Tips</p>
                    <p className="text-sm font-semibold text-orange-400">${totalTips.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Tip %</p>
                    <p className="text-sm font-semibold text-white">{tipPercentage.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-xs text-orange-400 font-medium mb-1">Tax Set Aside (25%)</p>
                <p className="text-xl font-bold text-orange-600">${taxSetAside.toFixed(2)}</p>
              </div>

              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
                <p className="text-xs text-teal-500 font-medium mb-1">Est. Take Home</p>
                <p className="text-xl font-bold text-teal-700">${takeHome.toFixed(2)}</p>
              </div>
            </div>

            {/* 7-day bar chart */}
            {view === "week" && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  Last 7 Days
                </p>
                <div className="flex items-end gap-2 h-24">
                  {last7Days.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#00C9B1] to-teal-300 transition-all duration-500"
                          style={{
                            height: `${Math.max((day.amount / maxDay) * 100, day.amount > 0 ? 8 : 0)}%`,
                            minHeight: day.amount > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform breakdown — tappable */}
            {platformRanking.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  By Platform · Tap to view entries
                </p>
                <div className="space-y-2">
                  {platformRanking.map(([name, stats], i) => (
                    <button
                      key={name}
                      onClick={() => setDrillPlatform(name)}
                      className="w-full flex items-center gap-3 bg-gray-50 hover:bg-teal-50 rounded-xl p-3 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-600 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                        <p className="text-xs text-gray-400">
                          Base ${stats.base.toFixed(2)} · Tips ${stats.tips.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#1A1A2E]">${stats.total.toFixed(2)}</p>
                      <span className="text-gray-300 text-xs">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Drill-down modal */}
      {drillPlatform && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setDrillPlatform(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
            <button
              onClick={() => setDrillPlatform(null)}
              aria-label="Close"
              className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-[#1A1A2E] mb-1">{drillPlatform}</h3>
            <p className="text-xs text-gray-500 mb-4">
              {drillEntries.length} {drillEntries.length === 1 ? "entry" : "entries"} ·{" "}
              {view === "week" ? "Last 7 days" : view === "month" ? "This month" : "This year"}
            </p>

            <div className="space-y-2">
              {drillEntries.map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Base ${(entry.base_pay || 0).toFixed(2)} · Tips ${(entry.tips || 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E]">${entryTotal(entry).toFixed(2)}</p>
                  </div>

                  {confirmDeleteId === entry.id ? (
                    <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg p-2">
                      <p className="text-xs text-red-700">Delete this entry?</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => entry.id && handleDelete(entry.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 rounded text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => entry.id && setConfirmDeleteId(entry.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Delete entry
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}