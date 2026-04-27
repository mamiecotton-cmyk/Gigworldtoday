"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import platformsData from "@/data/platforms.json";

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

interface EarningEntry {
  platform_id: string;
  platform_name: string;
  base_pay: string;
  tips: string;
  date: string;
}

interface Props {
  userPlatforms: { platform_id: string; platform_name: string }[];
  onSaved: () => void;
  userId?: string;
}

export default function DailyLogger({ userPlatforms, onSaved, userId }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState<EarningEntry[]>(
    userPlatforms.map((p) => ({
      platform_id: p.platform_id,
      platform_name: p.platform_name,
      base_pay: "",
      tips: "",
      date: today,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [needsPlatform, setNeedsPlatform] = useState(false);
  const [pendingParse, setPendingParse] = useState<any>(null);
  const [platformQuery, setPlatformQuery] = useState("");
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const updateEntry = (platformId: string, field: "base_pay" | "tips", value: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.platform_id === platformId ? { ...e, [field]: value } : e
      )
    );
  };

  const addPlatformToLog = (platform: any) => {
    if (!entries.find((e) => e.platform_id === platform.id)) {
      setEntries((prev) => [
        ...prev,
        {
          platform_id: platform.id,
          platform_name: platform.name,
          base_pay: "",
          tips: "",
          date,
        },
      ]);
    }
    setAddQuery("");
    setShowAddPlatform(false);
  };

  const removeEntry = (platformId: string) => {
    setEntries((prev) => prev.filter((e) => e.platform_id !== platformId));
  };

  // Screenshot upload and parse
  const handleScreenshot = useCallback(async (file: File) => {
    setParsing(true);
    setParseError(null);

    try {
      // Compress image before sending to stay under 4.5MB limit
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

      // Verify base64 is clean before sending
      console.log("Base64 length:", base64.length, "MimeType:", file.type);

      const payload = JSON.stringify({
        imageBase64: base64,
        mimeType: "image/jpeg", // always jpeg after canvas compression
      });

      console.log("Payload size (bytes):", payload.length);

      const res = await fetch("/api/parse-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        setParseError("Couldn't read the screenshot. Please enter values manually.");
        return;
      }

      if (data.date) setDate(data.date);

      if (data.platform) {
        // Find matching platform
        const match = activePlatforms.find(
          (p) => p.name.toLowerCase().includes(data.platform.toLowerCase()) ||
                 data.platform.toLowerCase().includes(p.name.toLowerCase())
        );

        if (match) {
          // Update or add entry for this platform
          setEntries((prev) => {
            const exists = prev.find((e) => e.platform_id === match.id);
            if (exists) {
              return prev.map((e) =>
                e.platform_id === match.id
                  ? {
                      ...e,
                      base_pay: data.base_pay?.toString() || e.base_pay,
                      tips: data.tips?.toString() || e.tips,
                    }
                  : e
              );
            } else {
              return [
                ...prev,
                {
                  platform_id: match.id,
                  platform_name: match.name,
                  base_pay: data.base_pay?.toString() || "",
                  tips: data.tips?.toString() || "",
                  date,
                },
              ];
            }
          });
        } else {
          // Platform detected but no match found
          setPendingParse(data);
          setNeedsPlatform(true);
        }
      } else {
        // No platform detected — ask user
        setPendingParse(data);
        setNeedsPlatform(true);
      }
    } catch (err) {
      setParseError("Failed to process screenshot. Please enter values manually.");
    } finally {
      setParsing(false);
    }
  }, [date]);

  const applyPendingParse = (platform: any) => {
    if (!pendingParse) return;
    setEntries((prev) => {
      const exists = prev.find((e) => e.platform_id === platform.id);
      if (exists) {
        return prev.map((e) =>
          e.platform_id === platform.id
            ? {
                ...e,
                base_pay: pendingParse.base_pay?.toString() || e.base_pay,
                tips: pendingParse.tips?.toString() || e.tips,
              }
            : e
        );
      } else {
        return [
          ...prev,
          {
            platform_id: platform.id,
            platform_name: platform.name,
            base_pay: pendingParse.base_pay?.toString() || "",
            tips: pendingParse.tips?.toString() || "",
            date,
          },
        ];
      }
    });
    setPendingParse(null);
    setNeedsPlatform(false);
    setPlatformQuery("");
  };

  const filteredPlatforms = platformQuery.length > 0
    ? activePlatforms.filter((p) =>
        p.name.toLowerCase().includes(platformQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const addFilteredPlatforms = addQuery.length > 0
    ? activePlatforms.filter((p) =>
        p.name.toLowerCase().includes(addQuery.toLowerCase()) &&
        !entries.find((e) => e.platform_id === p.id)
      ).slice(0, 6)
    : [];

  const save = async () => {
    const validEntries = entries.filter(
      (e) => e.base_pay !== "" || e.tips !== ""
    );

    if (validEntries.length === 0) return;
    setSaving(true);
    setSaveError(null);

    const uid = userId;
    console.log("Save userId:", uid);

    if (!uid) {
      console.log("No userId - cannot save");
      setSaving(false);
      setSaveError("Please sign in again before saving earnings.");
      return;
    }

    const rows = validEntries.map((e) => {
      const basePay = parseFloat(e.base_pay) || 0;
      const tips = parseFloat(e.tips) || 0;

      return {
        user_id: uid,
        platform_id: e.platform_id,
        platform_name: e.platform_name,
        date,
        base_pay: basePay,
        tips,
      };
    });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const sessionTimeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(new Error("Session check timed out. Please refresh and sign in again."));
        }, 5000);
      });

      const { data: { session }, error: sessionError } = await Promise.race([
        supabase.auth.getSession(),
        sessionTimeout,
      ]);

      if (sessionError || !session?.access_token) {
        setSaveError(sessionError?.message || "Please sign in again before saving earnings.");
        return;
      }

      const res = await fetch("/api/earnings-log", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSaveError(data.error || "Could not save earnings. Please try again.");
        return;
      }

      setSaved(true);
      window.setTimeout(() => {
        setSaved(false);
        onSaved();
      }, 800);
    } catch (err) {
      console.error("Save earnings failed:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        setSaveError("Save request timed out. Please check your connection and try again.");
      } else {
        setSaveError(err instanceof Error ? err.message : "Could not save earnings. Please try again.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  const totalEarnings = entries.reduce((sum, e) => {
    return sum + (parseFloat(e.base_pay) || 0) + (parseFloat(e.tips) || 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A2E]">Log Today's Earnings</h2>
          <p className="text-xs text-gray-400">Enter your earnings per platform</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[#00C9B1] outline-none"
        />
      </div>

      {/* Screenshot upload */}
      <div>
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
        <button
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-teal-200 rounded-xl text-sm text-teal-600 font-medium hover:border-teal-400 hover:bg-teal-50 transition-all disabled:opacity-50"
        >
          {parsing ? (
            <>
              <span className="animate-spin">⏳</span>
              Reading screenshot...
            </>
          ) : (
            <>
              📸 Upload Earnings Screenshot
            </>
          )}
        </button>
        {parseError && (
          <p className="text-xs text-red-500 mt-1">{parseError}</p>
        )}
      </div>

      {/* Platform not detected — ask user */}
      {needsPlatform && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">
            📍 Which platform is this screenshot from?
          </p>
          <div className="relative">
            <input
              type="text"
              value={platformQuery}
              onChange={(e) => setPlatformQuery(e.target.value)}
              placeholder="Type platform name..."
              className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 outline-none bg-white"
              autoFocus
            />
            {filteredPlatforms.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {filteredPlatforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPendingParse(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform entries */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.platform_id}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-[#1A1A2E]">
                {entry.platform_name}
              </span>
              <button
                onClick={() => removeEntry(entry.platform_id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">
                  Base Pay
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={entry.base_pay}
                    onChange={(e) => updateEntry(entry.platform_id, "base_pay", e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">
                  Tips
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={entry.tips}
                    onChange={(e) => updateEntry(entry.platform_id, "tips", e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>
            </div>
            {(entry.base_pay || entry.tips) && (
              <p className="text-xs text-teal-600 font-semibold mt-2 text-right">
                Total: ${((parseFloat(entry.base_pay) || 0) + (parseFloat(entry.tips) || 0)).toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add another platform */}
      <div className="relative">
        {showAddPlatform ? (
          <div>
            <input
              type="text"
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              placeholder="Search platforms..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00C9B1] outline-none"
              autoFocus
              onBlur={() => setTimeout(() => setShowAddPlatform(false), 200)}
            />
            {addFilteredPlatforms.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {addFilteredPlatforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPlatformToLog(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAddPlatform(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-teal-300 hover:text-teal-500 transition-all"
          >
            + Add another platform
          </button>
        )}
      </div>

      {/* Total and save */}
      {totalEarnings > 0 && (
        <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0f3460] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">Total for {date}</p>
            <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Set aside 25%</p>
            <p className="text-sm font-semibold text-orange-400">${(totalEarnings * 0.25).toFixed(2)}</p>
          </div>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || saved || totalEarnings === 0}
        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-orange-500/20"
      >
        {saved ? "✅ Saved!" : saving ? "Saving..." : "Save Day's Earnings"}
      </button>
      {saveError && (
        <p className="text-xs text-red-500 text-center">{saveError}</p>
      )}
    </div>
  );
}
