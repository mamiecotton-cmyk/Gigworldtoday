"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatLocalDate } from "@/lib/dateUtils";
import PlatformLogo from "@/components/PlatformLogo";

interface EarningsData {
  id?: string;
  platform_id?: string;
  platform_name: string;
  base_pay: number;
  tips: number;
  adjustments?: number;
  bonuses?: number;
  total_pay?: number;
  date: string;
}

interface Props {
  deeplink?: { platform_name: string; date: string } | null;
  onDeeplinkConsumed?: () => void;
}

export default function EarningsDashboard({ deeplink, onDeeplinkConsumed }: Props = {}) {
  const [data, setData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "month" | "year">("week");
  const [drillPlatform, setDrillPlatform] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editBase, setEditBase] = useState("");
  const [editTips, setEditTips] = useState("");
  const [editAdjustments, setEditAdjustments] = useState("");
  const [editBonuses, setEditBonuses] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editDuplicatePrompt, setEditDuplicatePrompt] = useState<string | null>(null);

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
          .select("id, platform_id, platform_name, base_pay, tips, adjustments, bonuses, total_pay, date")
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

  // Handle deeplink from Recent strip — auto-set view + open modal
  useEffect(() => {
    if (!deeplink) return;

    // Determine which view contains the date
    const entryDate = new Date(deeplink.date);
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (entryDate >= sevenDaysAgo) {
      setView("week");
    } else if (
      entryDate.getFullYear() === now.getFullYear() &&
      entryDate.getMonth() === now.getMonth()
    ) {
      setView("month");
    } else if (entryDate.getFullYear() === now.getFullYear()) {
      setView("year");
    } else {
      setView("year");
    }

    setDrillPlatform(deeplink.platform_name);
    onDeeplinkConsumed?.();
  }, [deeplink, onDeeplinkConsumed]);

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

  const startEdit = (entry: EarningsData) => {
    if (!entry.id) return;
    setEditingId(entry.id);
    setEditDate(entry.date);
    setEditBase((entry.base_pay || 0).toString());
    setEditTips((entry.tips || 0).toString());
    setEditAdjustments((entry.adjustments || 0).toString());
    setEditBonuses((entry.bonuses || 0).toString());
    setEditError(null);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const checkEditDuplicate = async (id: string): Promise<boolean> => {
    const editing = data.find((e) => e.id === id);
    if (!editing) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: existing } = await supabase
      .from("earnings_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform_name", editing.platform_name)
      .eq("date", editDate)
      .eq("base_pay", parseFloat(editBase) || 0)
      .eq("tips", parseFloat(editTips) || 0)
      .eq("adjustments", parseFloat(editAdjustments) || 0)
      .eq("bonuses", parseFloat(editBonuses) || 0)
      .neq("id", id)
      .maybeSingle();

    return !!existing;
  };

  const performEditSave = async (id: string) => {
    setEditSaving(true);
    setEditError(null);
    setEditDuplicatePrompt(null);

    const { error: updateErr } = await supabase
      .from("earnings_log")
      .update({
        date: editDate,
        base_pay: parseFloat(editBase) || 0,
        tips: parseFloat(editTips) || 0,
        adjustments: parseFloat(editAdjustments) || 0,
        bonuses: parseFloat(editBonuses) || 0,
      })
      .eq("id", id);

    if (updateErr) {
      setEditError(updateErr.message);
      setEditSaving(false);
      return;
    }

    setEditingId(null);
    setEditSaving(false);
    await fetchEarnings();
  };

  const saveEdit = async (id: string) => {
    setEditError(null);
    const isDuplicate = await checkEditDuplicate(id);
    if (isDuplicate) {
      setEditDuplicatePrompt(id);
      return;
    }
    await performEditSave(id);
  };

  // Calculations
  const entryTotal = (entry: EarningsData) =>
    (entry.base_pay || 0) +
    (entry.tips || 0) +
    (entry.adjustments || 0) +
    (entry.bonuses || 0);

  const totalBase = data.reduce((s, e) => s + (e.base_pay || 0), 0);
  const totalTips = data.reduce((s, e) => s + (e.tips || 0), 0);
  const totalAdjustments = data.reduce((s, e) => s + (e.adjustments || 0), 0);
  const totalBonuses = data.reduce((s, e) => s + (e.bonuses || 0), 0);
  const totalEarnings = totalBase + totalTips + totalAdjustments + totalBonuses;
  const taxSetAside = totalEarnings * 0.25;
  const takeHome = totalEarnings - taxSetAside;
  const tipPercentage = totalEarnings > 0 ? (totalTips / totalEarnings) * 100 : 0;

  const byPlatform = data.reduce((acc, e) => {
    if (!acc[e.platform_name]) {
      acc[e.platform_name] = { platform_id: (e as any).platform_id || "", base: 0, tips: 0, adjustments: 0, bonuses: 0, total: 0 };
    }
    acc[e.platform_name].base += e.base_pay || 0;
    acc[e.platform_name].tips += e.tips || 0;
    acc[e.platform_name].adjustments += e.adjustments || 0;
    acc[e.platform_name].bonuses += e.bonuses || 0;
    acc[e.platform_name].total += entryTotal(e);
    return acc;
  }, {} as Record<string, { platform_id: string; base: number; tips: number; adjustments: number; bonuses: number; total: number }>);

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
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Base Pay</p>
                    <p className="text-sm font-semibold text-teal-400">${totalBase.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Tips</p>
                    <p className="text-sm font-semibold text-orange-400">${totalTips.toFixed(2)}</p>
                  </div>
                  {totalAdjustments > 0 && (
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Adjustments</p>
                      <p className="text-sm font-semibold text-blue-300">${totalAdjustments.toFixed(2)}</p>
                    </div>
                  )}
                  {totalBonuses > 0 && (
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Bonuses</p>
                      <p className="text-sm font-semibold text-purple-300">${totalBonuses.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Tip %</p>
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
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-600 flex-shrink-0">
                        {i + 1}
                      </div>
                      <PlatformLogo
                        platform_id={stats.platform_id}
                        platform_name={name}
                        size={28}
                      />
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
          onClick={() => {
            setDrillPlatform(null);
            setEditingId(null);
            setConfirmDeleteId(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
            <button
              onClick={() => {
                setDrillPlatform(null);
                setEditingId(null);
                setConfirmDeleteId(null);
              }}
              aria-label="Close"
              className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-1">
              <PlatformLogo
                platform_id={byPlatform[drillPlatform]?.platform_id || ""}
                platform_name={drillPlatform}
                size={36}
              />
              <h3 className="text-lg font-bold text-[#1A1A2E]">{drillPlatform}</h3>
            </div>
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
                        {formatLocalDate(entry.date, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Base ${(entry.base_pay || 0).toFixed(2)} · Tips ${(entry.tips || 0).toFixed(2)}
                        {(entry.adjustments || 0) > 0 && ` · Adj $${(entry.adjustments || 0).toFixed(2)}`}
                        {(entry.bonuses || 0) > 0 && ` · Bonus $${(entry.bonuses || 0).toFixed(2)}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E]">${entryTotal(entry).toFixed(2)}</p>
                  </div>

                  {/* Confirm delete */}
                  {confirmDeleteId === entry.id && (
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
                  )}

                  {/* Edit form */}
                  {editingId === entry.id && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Base Pay
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editBase}
                              onChange={(e) => setEditBase(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Tips
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editTips}
                              onChange={(e) => setEditTips(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Adjustments
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editAdjustments}
                              onChange={(e) => setEditAdjustments(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Bonuses
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editBonuses}
                              onChange={(e) => setEditBonuses(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => entry.id && saveEdit(entry.id)}
                          disabled={editSaving}
                          className="flex-1 py-1.5 bg-[#1A1A2E] text-white rounded text-xs font-semibold hover:opacity-90 disabled:opacity-40"
                        >
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={editSaving}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                      {editError && <p className="text-xs text-red-500">{editError}</p>}

                      {editDuplicatePrompt === entry.id && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                          <p className="text-xs text-amber-900 mb-2">
                            This looks like a duplicate. Save anyway?
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => entry.id && performEditSave(entry.id)}
                              disabled={editSaving}
                              className="flex-1 px-2 py-1 rounded text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                              Yes, save
                            </button>
                            <button
                              onClick={() => setEditDuplicatePrompt(null)}
                              className="flex-1 px-2 py-1 rounded text-xs font-medium bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons (hidden during edit/delete confirm) */}
                  {editingId !== entry.id && confirmDeleteId !== entry.id && (
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-gray-500 hover:text-teal-600 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => entry.id && setConfirmDeleteId(entry.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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