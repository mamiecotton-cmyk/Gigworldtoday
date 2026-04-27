"use client";

import { useState, useRef, useCallback } from "react";
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
  id: string; // unique row id (allows same platform on different days)
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
  accessToken?: string;
}

const newRowId = () => `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function DailyLogger({ userPlatforms, onSaved, userId, accessToken }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [entries, setEntries] = useState<EarningEntry[]>([]);
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

  const addRow = (platform: { id?: string; platform_id?: string; name?: string; platform_name?: string }, prefill?: { base_pay?: string; tips?: string; date?: string }) => {
    const platform_id = platform.id || platform.platform_id || "";
    const platform_name = platform.name || platform.platform_name || "";
    setEntries((prev) => [
      ...prev,
      {
        id: newRowId(),
        platform_id,
        platform_name,
        base_pay: prefill?.base_pay ?? "",
        tips: prefill?.tips ?? "",
        date: prefill?.date ?? today,
      },
    ]);
  };

  const updateEntry = (rowId: string, field: "base_pay" | "tips" | "date", value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === rowId ? { ...e, [field]: value } : e))
    );
  };

  const removeEntry = (rowId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== rowId));
  };

  // Screenshot parsing
  const handleScreenshot = useCallback(async (file: File) => {
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

      const res = await fetch("/api/parse-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError("Couldn't read the screenshot. Please enter values manually.");
        return;
      }

      const parsedDate = data.date || today;

      if (data.platform) {
        const match = activePlatforms.find(
          (p) =>
            p.name.toLowerCase().includes(data.platform.toLowerCase()) ||
            data.platform.toLowerCase().includes(p.name.toLowerCase())
        );
        if (match) {
          addRow(match, {
            base_pay: data.base_pay?.toString() || "",
            tips: data.tips?.toString() || "",
            date: parsedDate,
          });
        } else {
          setPendingParse({ ...data, date: parsedDate });
          setNeedsPlatform(true);
        }
      } else {
        setPendingParse({ ...data, date: parsedDate });
        setNeedsPlatform(true);
      }
    } catch {
      setParseError("Failed to process screenshot. Please enter values manually.");
    } finally {
      setParsing(false);
    }
  }, [today]);

  const applyPendingParse = (platform: any) => {
    if (!pendingParse) return;
    addRow(platform, {
      base_pay: pendingParse.base_pay?.toString() || "",
      tips: pendingParse.tips?.toString() || "",
      date: pendingParse.date || today,
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
        p.name.toLowerCase().includes(addQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const save = async () => {
    const validEntries = entries.filter((e) => e.base_pay !== "" || e.tips !== "");
    if (validEntries.length === 0) return;
    setSaving(true);
    setSaveError(null);

    if (!userId) {
      setSaving(false);
      setSaveError("Please sign in again before saving earnings.");
      return;
    }
    if (!accessToken) {
      setSaving(false);
      setSaveError("Please refresh and sign in again before saving earnings.");
      return;
    }

    const rows = validEntries.map((e) => ({
      user_id: userId,
      platform_id: e.platform_id,
      platform_name: e.platform_name,
      date: e.date,
      base_pay: parseFloat(e.base_pay) || 0,
      tips: parseFloat(e.tips) || 0,
    }));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/earnings-log", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

  const totalEarnings = entries.reduce(
    (sum, e) => sum + (parseFloat(e.base_pay) || 0) + (parseFloat(e.tips) || 0),
    0
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-[#1A1A2E]">Log Earnings</h2>
        <p className="text-xs text-gray-400">Tap a saved platform or add manually</p>
      </div>

      {/* Saved-platform quick chips */}
      {userPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {userPlatforms.map((p) => (
            <button
              key={p.platform_id}
              onClick={() => addRow(p)}
              className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-all border border-teal-100"
            >
              + {p.platform_name}
            </button>
          ))}
        </div>
      )}

      {/* Screenshot + Manual add row */}
      <div className="flex gap-2">
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
          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-dashed border-teal-200 rounded-lg text-xs text-teal-600 font-medium hover:border-teal-400 hover:bg-teal-50 transition-all disabled:opacity-50"
        >
          {parsing ? <><span className="animate-spin">⏳</span> Reading…</> : <>📸 Screenshot</>}
        </button>
        <button
          onClick={() => setShowAddPlatform(true)}
          className="flex-1 py-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 font-medium hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
        >
          + Manually Add Earnings
        </button>
      </div>

      {parseError && <p className="text-xs text-red-500">{parseError}</p>}

      {/* Add platform search */}
      {showAddPlatform && (
        <div className="relative">
          <input
            type="text"
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
            placeholder="Search platforms..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#00C9B1] outline-none"
            autoFocus
            onBlur={() => setTimeout(() => { setShowAddPlatform(false); setAddQuery(""); }, 200)}
          />
          {addFilteredPlatforms.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {addFilteredPlatforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { addRow(p); setShowAddPlatform(false); setAddQuery(""); }}
                  className="w-full px-3 py-2 hover:bg-teal-50 text-left text-sm font-medium text-gray-800"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending screenshot — needs platform */}
      {needsPlatform && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-800 mb-2">📍 Which platform is this from?</p>
          <div className="relative">
            <input
              type="text"
              value={platformQuery}
              onChange={(e) => setPlatformQuery(e.target.value)}
              placeholder="Type platform name..."
              className="w-full border border-amber-200 rounded-lg px-3 py-1.5 text-sm focus:border-amber-400 outline-none bg-white"
              autoFocus
            />
            {filteredPlatforms.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                {filteredPlatforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPendingParse(p)}
                    className="w-full px-3 py-2 hover:bg-teal-50 text-left text-sm font-medium text-gray-800"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !needsPlatform && (
        <div className="text-center py-6 text-xs text-gray-400">
          No earnings to log yet — click + Manually Add Earnings to start
        </div>
      )}

      {/* Entry rows */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-[#1A1A2E] truncate">{entry.platform_name}</span>
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-0.5 focus:border-[#00C9B1] outline-none"
                />
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xs ml-2"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={entry.base_pay}
                    onChange={(e) => updateEntry(entry.id, "base_pay", e.target.value)}
                    placeholder="Base"
                    className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none bg-white"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={entry.tips}
                    onChange={(e) => updateEntry(entry.id, "tips", e.target.value)}
                    placeholder="Tips"
                    className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:border-[#00C9B1] outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total + Save (only when there are rows) */}
      {entries.length > 0 && (
        <>
          {totalEarnings > 0 && (
            <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0f3460] rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wide">Total ({entries.length} {entries.length === 1 ? "entry" : "entries"})</p>
                <p className="text-xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">Set aside 25%</p>
                <p className="text-sm font-semibold text-orange-400">${(totalEarnings * 0.25).toFixed(2)}</p>
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving || saved || totalEarnings === 0}
            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-orange-500/20"
          >
            {saved ? "✅ Saved!" : saving ? "Saving..." : "Save Earnings"}
          </button>
          {saveError && <p className="text-xs text-red-500 text-center">{saveError}</p>}
        </>
      )}
    </div>
  );
}
