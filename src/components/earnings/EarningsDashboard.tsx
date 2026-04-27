"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface EarningsData {
  platform_name: string;
  base_pay: number;
  tips: number;
  total_pay: number;
  date: string;
}

export default function EarningsDashboard() {
  const [data, setData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    fetchEarnings();
  }, [view]);

  const fetchEarnings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

    const { data: earnings } = await supabase
      .from("earnings_log")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .order("date", { ascending: false });

    setData(earnings || []);
    setLoading(false);
  };

  // Calculations
  const totalBase = data.reduce((s, e) => s + (e.base_pay || 0), 0);
  const totalTips = data.reduce((s, e) => s + (e.tips || 0), 0);
  const totalEarnings = totalBase + totalTips;
  const taxSetAside = totalEarnings * 0.25;
  const takeHome = totalEarnings - taxSetAside;
  const tipPercentage = totalEarnings > 0 ? (totalTips / totalEarnings) * 100 : 0;

  // YTD
  const ytdTotal = data.reduce((s, e) => s + (e.total_pay || 0), 0);

  // Per platform breakdown
  const byPlatform = data.reduce((acc, e) => {
    if (!acc[e.platform_name]) {
      acc[e.platform_name] = { base: 0, tips: 0, total: 0 };
    }
    acc[e.platform_name].base += e.base_pay || 0;
    acc[e.platform_name].tips += e.tips || 0;
    acc[e.platform_name].total += e.total_pay || 0;
    return acc;
  }, {} as Record<string, { base: number; tips: number; total: number }>);

  const platformRanking = Object.entries(byPlatform)
    .sort((a, b) => b[1].total - a[1].total);

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayEarnings = data
      .filter((e) => e.date === dateStr)
      .reduce((s, e) => s + (e.total_pay || 0), 0);
    return {
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: dayEarnings,
    };
  });

  const maxDay = Math.max(...last7Days.map((d) => d.amount), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  return (
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

          {/* Platform breakdown */}
          {platformRanking.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                By Platform
              </p>
              <div className="space-y-2">
                {platformRanking.map(([name, stats], i) => (
                  <div key={name} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
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
