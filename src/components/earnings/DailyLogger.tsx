"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import platformsData from "@/data/platforms.json";
import { formatLocalDate } from "@/lib/dateUtils";
import PlatformLogo from "@/components/PlatformLogo";

const inactiveStatuses = [
  "absorbed", "merged", "rebranded", "shut_down", "shutdown",
  "permanently_closed", "no_longer_hiring", "not_hiring", "closed",
  "inactive", "defunct", "acquired", "out_of_business", "retired",
  "discontinued", "suspended", "paused", "terminated", "ended",
  "legacy", "archived",
];

const activePlatforms = (platformsData as any[]).filter(
  (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
);

interface Recent {
  id: string;
  platform_id: string;
  platform_name: string;
  date: string;
  total: number;
}

interface Props {
  userPlatforms: { platform_id: string; platform_name: string }[];
  onSaved: () => void;
  onPlatformsChanged?: () => void;
  userId?: string;
  accessToken?: string;
  onOpenInDashboard?: (platform_name: string, date: string) => void;
}

export default function DailyLogger({ userPlatforms, onSaved, onPlatformsChanged, userId, accessToken, onOpenInDashboard }: Props) {
  const today = new Date().toISOString().split("T")[0];

  // Sort alphabetically
  const sortedPlatforms = [...userPlatforms].sort((a, b) =>
    a.platform_name.localeCompare(b.platform_name)
  );

  // Selected chip + form state
  const [selectedPlatform, setSelectedPlatform] = useState<{ id: string; name: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [basePay, setBasePay] = useState("");
  const [tips, setTips] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicatePrompt, setDuplicatePrompt] = useState(false);

  // Hint when buttons tapped without a chip selected
  const [hint, setHint] = useState<string | null>(null);

  // "+ Other" search
  const [showOther, setShowOther] = useState(false);
  const [otherQuery, setOtherQuery] = useState("");

  // After picking from + Other, ask: just once or save?
  const [pendingOther, setPendingOther] = useState<{ id: string; name: string } | null>(null);

  // Screenshot
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Multi-order state
  const [parsedOrders, setParsedOrders] = useState<Array<{ base_pay: string; tips: string; adjustments: string; bonuses: string; date: string }>>([]); 
  const [orderIndex, setOrderIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Recent + today total
  const [todayTotal, setTodayTotal] = useState(0);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);

  const loadRecent = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("earnings_log")
      .select("id, platform_id, platform_name, date, base_pay, tips, adjustments, bonuses")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setRecent(
        data.map((r: any) => ({
          id: r.id,
          platform_id: r.platform_id,
          platform_name: r.platform_name,
          date: r.date,
          total: (r.base_pay || 0) + (r.tips || 0) + (r.adjustments || 0) + (r.bonuses || 0),
        }))
      );
    }

    const { data: todayData } = await supabase
      .from("earnings_log")
      .select("base_pay, tips, adjustments, bonuses")
      .eq("user_id", userId)
      .eq("date", today);

    if (todayData) {
      const sum = todayData.reduce(
        (acc: number, r: any) => acc + (r.base_pay || 0) + (r.tips || 0) + (r.adjustments || 0) + (r.bonuses || 0),
        0
      );
      setTodayTotal(sum);
    }
  }, [userId, today]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  const flashHint = (msg: string) => {
    setHint(msg);
    setTimeout(() => setHint(null), 2500);
  };

  const selectChip = (id: string, name: string) => {
    if (selectedPlatform?.id === id) {
      setSelectedPlatform(null); // tap again to deselect
    } else {
      setSelectedPlatform({ id, name });
      setHint(null);
    }
  };

  const openManual = () => {
    if (!selectedPlatform) {
      flashHint("Pick a platform first");
      return;
    }
    setBasePay("");
    setTips("");
    setDate(today);
    setSaveError(null);
    setFormOpen(true);
  };

  const openUpload = () => {
    if (!selectedPlatform) {
      flashHint("Pick a platform first");
      return;
    }
    fileRef.current?.click();
  };

  const handleScreenshot = useCallback(async (file: File) => {
    if (!selectedPlatform) return;
    setParsing(true);
    setParseError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1200;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          URL.revokeObjectURL(url);
          resolve(compressed.split(",")[1]);
        };
        img.onerror = reject;
        img.src = url;
      });

      // Get user's local date (avoids UTC server timezone mismatch)
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const res = await fetch("/api/parse-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg", localDate }),
      });
      const data = await res.json();

      if (!res.ok) {
        setParseError("Couldn't read the screenshot. Try manual entry.");
        return;
      }

      const orders = Array.isArray(data.orders) ? data.orders : [];

      if (orders.length === 0) {
        setParsedOrders([]);
        setOrderIndex(0);
        setSavedCount(0);
        setBasePay("");
        setTips("");
        setAdjustments("");
        setBonuses("");
        setDate(today);
        setFormOpen(true);
        return;
      }

      // Normalize each order — coerce values to strings, fall back to today for invalid dates
      const normalized = orders.map((o: any) => {
        const validDate = o.date && /^\d{4}-\d{2}-\d{2}$/.test(o.date) ? o.date : today;
        return {
          base_pay: o.base_pay != null ? o.base_pay.toString() : "",
          tips: o.tips != null ? o.tips.toString() : "",
          adjustments: o.adjustments != null ? o.adjustments.toString() : "",
          bonuses: o.bonuses != null ? o.bonuses.toString() : "",
          date: validDate,
        };
      });

      setParsedOrders(normalized);
      setOrderIndex(0);
      setSavedCount(0);

      // Pre-fill form with first order
      setBasePay(normalized[0].base_pay);
      setTips(normalized[0].tips);
      setAdjustments(normalized[0].adjustments);
      setBonuses(normalized[0].bonuses);
      setDate(normalized[0].date);
      setFormOpen(true);
    } catch {
      setParseError("Failed to process screenshot. Try manual entry.");
    } finally {
      setParsing(false);
    }
  }, [selectedPlatform, today]);

  const isMultiOrder = parsedOrders.length > 1;
  const hasMoreOrders = parsedOrders.length > 0 && orderIndex < parsedOrders.length - 1;

  const resetMultiOrderState = () => {
    setParsedOrders([]);
    setOrderIndex(0);
    setSavedCount(0);
  };

  const cancelForm = () => {
    setFormOpen(false);
    setBasePay("");
    setTips("");
    setAdjustments("");
    setBonuses("");
    setDate(today);
    setSaveError(null);
    setDuplicatePrompt(false);
    resetMultiOrderState();
    if (savedCount > 0) {
      // Some orders were saved before cancel — flash chip and refresh recent
      if (selectedPlatform) {
        setFlashId(selectedPlatform.id);
        setTimeout(() => setFlashId(null), 1500);
      }
      setSelectedPlatform(null);
      loadRecent();
      onSaved();
    }
  };

  const advanceToNextOrder = () => {
    const nextIdx = orderIndex + 1;
    if (nextIdx >= parsedOrders.length) {
      setFormOpen(false);
      if (selectedPlatform) {
        setFlashId(selectedPlatform.id);
        setTimeout(() => setFlashId(null), 1500);
      }
      setSelectedPlatform(null);
      setBasePay("");
      setTips("");
      setAdjustments("");
      setBonuses("");
      setDate(today);
      resetMultiOrderState();
      loadRecent();
      onSaved();
    } else {
      const next = parsedOrders[nextIdx];
      setOrderIndex(nextIdx);
      setBasePay(next.base_pay);
      setTips(next.tips);
      setAdjustments(next.adjustments);
      setBonuses(next.bonuses);
      setDate(next.date);
      setSaveError(null);
      setDuplicatePrompt(false);
    }
  };

  const skipCurrentOrder = () => {
    advanceToNextOrder();
  };

  const checkForDuplicate = async (): Promise<boolean> => {
    if (!userId || !selectedPlatform) return false;
    const { data: existing } = await supabase
      .from("earnings_log")
      .select("id")
      .eq("user_id", userId)
      .eq("platform_id", selectedPlatform.id)
      .eq("date", date)
      .eq("base_pay", parseFloat(basePay) || 0)
      .eq("tips", parseFloat(tips) || 0)
      .eq("adjustments", parseFloat(adjustments) || 0)
      .eq("bonuses", parseFloat(bonuses) || 0)
      .maybeSingle();
    return !!existing;
  };

  const performSave = async () => {
    if (!selectedPlatform || !userId || !accessToken) return;
    setSaving(true);
    setSaveError(null);
    setDuplicatePrompt(false);

    const row = {
      user_id: userId,
      platform_id: selectedPlatform.id,
      platform_name: selectedPlatform.name,
      date,
      base_pay: parseFloat(basePay) || 0,
      tips: parseFloat(tips) || 0,
      adjustments: parseFloat(adjustments) || 0,
      bonuses: parseFloat(bonuses) || 0,
    };

    try {
      const res = await fetch("/api/earnings-log", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows: [row] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(data.error || "Could not save");
        return;
      }

      setSavedCount((c) => c + 1);
      advanceToNextOrder();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!selectedPlatform) return;
    if (basePay === "" && tips === "" && adjustments === "" && bonuses === "") {
      setSaveError("Enter at least one amount");
      return;
    }
    if (!userId || !accessToken) {
      setSaveError("Please sign in again before saving");
      return;
    }

    setSaveError(null);
    const isDuplicate = await checkForDuplicate();
    if (isDuplicate) {
      setDuplicatePrompt(true);
      return;
    }

    await performSave();
  };

  // + Other
  const otherFiltered = otherQuery.length > 0
    ? activePlatforms
        .filter((p) =>
          p.name.toLowerCase().includes(otherQuery.toLowerCase()) &&
          !userPlatforms.find((up) => up.platform_id === p.id)
        )
        .slice(0, 6)
    : [];

  const pickFromOther = (p: { id: string; name: string }) => {
    setPendingOther(p);
    setShowOther(false);
    setOtherQuery("");
  };

  const useOnce = () => {
    if (pendingOther) {
      setSelectedPlatform({ id: pendingOther.id, name: pendingOther.name });
    }
    setPendingOther(null);
  };

  const addToSaved = async () => {
    if (!pendingOther || !userId) return;
    await supabase.from("user_platforms").upsert({
      user_id: userId,
      platform_id: pendingOther.id,
      platform_name: pendingOther.name,
      display_order: userPlatforms.length,
    }, { onConflict: "user_id,platform_id" });

    setSelectedPlatform({ id: pendingOther.id, name: pendingOther.name });
    setPendingOther(null);
    onPlatformsChanged?.(); // Trigger parent to reload userPlatforms (without switching tabs)
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleScreenshot(file);
          e.target.value = "";
        }}
      />

      {/* Today's total */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] rounded-xl p-3.5">
        <p className="text-[10px] text-white/50 uppercase tracking-wider">Logged today</p>
        <p className="text-2xl font-bold text-white">${todayTotal.toFixed(2)}</p>
      </div>

      {/* Platform chips */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
          Tap a platform
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sortedPlatforms.map((p) => {
            const isSelected = selectedPlatform?.id === p.platform_id;
            const isFlashing = flashId === p.platform_id;
            return (
              <button
                key={p.platform_id}
                onClick={() => selectChip(p.platform_id, p.platform_name)}
                disabled={formOpen}
                className={`flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-xs font-medium transition-all border disabled:opacity-50 active:scale-95 ${
                  isFlashing
                    ? "bg-green-100 text-green-700 border-green-200"
                    : isSelected
                    ? "bg-teal-500 text-white border-teal-500 animate-pulse-glow"
                    : "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100 hover:-translate-y-0.5"
                }`}
              >
                {!isFlashing && (
                  <PlatformLogo
                    platform_id={p.platform_id}
                    platform_name={p.platform_name}
                    size={20}
                  />
                )}
                <span>{isFlashing ? "✓ Logged" : p.platform_name}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowOther(!showOther)}
            disabled={formOpen}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-500 border border-dashed border-gray-300 hover:border-teal-300 hover:text-teal-600 disabled:opacity-50"
          >
            + Other
          </button>
        </div>

        {/* + Other search */}
        {showOther && !pendingOther && (
          <div className="relative mt-2">
            <input
              type="text"
              value={otherQuery}
              onChange={(e) => setOtherQuery(e.target.value)}
              placeholder="Search platforms..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#00C9B1] outline-none"
              autoFocus
            />
            {otherFiltered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                {otherFiltered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => pickFromOther({ id: p.id, name: p.name })}
                    className="w-full px-3 py-2 hover:bg-teal-50 text-left text-sm font-medium text-gray-800"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Just once / Add to saved */}
        {pendingOther && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900 mb-2">
              Log earnings for <strong>{pendingOther.name}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={useOnce}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Just this once
              </button>
              <button
                onClick={addToSaved}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Add to my platforms
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={openUpload}
          disabled={parsing || formOpen}
          className="py-2.5 border border-dashed border-teal-200 rounded-lg text-xs text-teal-600 font-medium hover:border-teal-400 hover:bg-teal-50 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
        >
          {parsing ? "⏳ Reading..." : "📸 Upload Screenshot"}
        </button>
        <button
          onClick={openManual}
          disabled={formOpen}
          className="py-2.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600 font-medium hover:border-teal-300 hover:text-teal-600 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
        >
          ✍️ Manual Entry
        </button>
      </div>
      {hint && <p className="text-xs text-amber-600 text-center -mt-2">{hint}</p>}
      {parseError && <p className="text-xs text-red-500 text-center -mt-2">{parseError}</p>}

      {/* Inline entry form */}
      {formOpen && selectedPlatform && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          {/* Header with order banner */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#1A1A2E] flex-1">{selectedPlatform.name}</p>
            {isMultiOrder && (
              <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                Order {orderIndex + 1} of {parsedOrders.length}
              </span>
            )}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 focus:border-[#00C9B1] outline-none bg-white"
            />
          </div>

          {/* Progress bar for multi-order */}
          {isMultiOrder && (
            <div className="flex gap-1">
              {parsedOrders.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i < orderIndex ? "bg-green-500" : i === orderIndex ? "bg-[#00C9B1]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Saved-so-far indicator */}
          {isMultiOrder && savedCount > 0 && (
            <p className="text-xs text-green-600">
              ✓ {savedCount} {savedCount === 1 ? "order" : "orders"} saved
            </p>
          )}

          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Base Pay
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={basePay}
                onChange={(e) => setBasePay(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-base focus:border-[#00C9B1] outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Tips
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-base focus:border-[#00C9B1] outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Adjustments <span className="text-gray-400 normal-case font-normal">(state minimum top-ups)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-base focus:border-[#00C9B1] outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Bonuses <span className="text-gray-400 normal-case font-normal">(boosts, peak, promos, etc.)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={bonuses}
                onChange={(e) => setBonuses(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-base focus:border-[#00C9B1] outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-[#1A1A2E] hover:bg-[#0f3460] hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0 transition-all text-sm"
            >
              {saving ? "Saving..." : hasMoreOrders ? "Save & Next" : "Save"}
            </button>
            <button
              onClick={cancelForm}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 text-sm"
            >
              {savedCount > 0 ? "Done" : "Cancel"}
            </button>
          </div>

          {/* Skip button — only when multi-order and we have more orders to process */}
          {isMultiOrder && hasMoreOrders && (
            <button
              onClick={skipCurrentOrder}
              disabled={saving}
              className="w-full text-xs text-gray-500 hover:text-teal-600 transition-colors disabled:opacity-50"
            >
              Skip this order →
            </button>
          )}

          {saveError && <p className="text-xs text-red-500 text-center">{saveError}</p>}

          {duplicatePrompt && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-900 mb-2">
                This looks like a duplicate of an existing entry. Save anyway?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={performSave}
                  disabled={saving}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Yes, save anyway
                </button>
                <button
                  onClick={() => setDuplicatePrompt(false)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && !formOpen && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
            Recent
          </p>
          <div className="space-y-1">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center text-xs py-1.5 px-1 group"
              >
                <button
                  onClick={() => onOpenInDashboard?.(r.platform_name, r.date)}
                  className="flex-1 flex items-center justify-between text-left hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors gap-2"
                >
                  <span className="flex items-center gap-2 min-w-0 flex-1">
                    <PlatformLogo
                      platform_id={r.platform_id}
                      platform_name={r.platform_name}
                      size={18}
                    />
                    <span className="text-gray-700 truncate">
                      <span className="font-medium">{r.platform_name}</span>
                      <span className="text-gray-400">
                        {" · "}
                        {r.date === today ? "today" : formatLocalDate(r.date)}
                      </span>
                    </span>
                  </span>
                  <span className="text-gray-700 font-medium flex-shrink-0">${r.total.toFixed(2)}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}