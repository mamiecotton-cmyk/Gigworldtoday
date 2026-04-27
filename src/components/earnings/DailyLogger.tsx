"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import platformsData from "@/data/platforms.json";
import EntrySheet from "./EntrySheet";

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
  platform_name: string;
  date: string;
  total: number;
}

interface Props {
  userPlatforms: { platform_id: string; platform_name: string }[];
  onSaved: () => void;
  userId?: string;
  accessToken?: string;
}

export default function DailyLogger({ userPlatforms, onSaved, userId, accessToken }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [activePlatform, setActivePlatform] = useState<{ id: string; name: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [otherQuery, setOtherQuery] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [needsPlatform, setNeedsPlatform] = useState(false);
  const [pendingParse, setPendingParse] = useState<any>(null);
  const [platformQuery, setPlatformQuery] = useState("");
  const [todayTotal, setTodayTotal] = useState(0);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load today's total + recent entries
  const loadRecent = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("earnings_log")
      .select("id, platform_name, date, base_pay, tips")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setRecent(
        data.map((r: any) => ({
          id: r.id,
          platform_name: r.platform_name,
          date: r.date,
          total: (r.base_pay || 0) + (r.tips || 0),
        }))
      );
    }

    const { data: todayData } = await supabase
      .from("earnings_log")
      .select("base_pay, tips")
      .eq("user_id", userId)
      .eq("date", today);

    if (todayData) {
      const sum = todayData.reduce(
        (acc: number, r: any) => acc + (r.base_pay || 0) + (r.tips || 0),
        0
      );
      setTodayTotal(sum);
    }
  }, [userId, today]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  const openSheetFor = (id: string, name: string) => {
    setActivePlatform({ id, name });
    setSheetOpen(true);
  };

  const handleSave = async ({ base_pay, tips, date }: { base_pay: string; tips: string; date: string }) => {
    if (!userId || !accessToken) {
      throw new Error("Please sign in again before saving");
    }
    if (!activePlatform) return;

    const row = {
      user_id: userId,
      platform_id: activePlatform.id,
      platform_name: activePlatform.name,
      date,
      base_pay: parseFloat(base_pay) || 0,
      tips: parseFloat(tips) || 0,
    };

    const res = await fetch("/api/earnings-log", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rows: [row] }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Could not save");
    }

    setSheetOpen(false);
    setFlashId(activePlatform.id);
    setTimeout(() => setFlashId(null), 1200);
    await loadRecent();
    onSaved();
  };

  // Screenshot
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
        setParseError("Couldn't read the screenshot.");
        return;
      }

      if (data.platform) {
        const match = activePlatforms.find(
          (p) =>
            p.name.toLowerCase().includes(data.platform.toLowerCase()) ||
            data.platform.toLowerCase().includes(p.name.toLowerCase())
        );
        if (match) {
          setActivePlatform({ id: match.id, name: match.name });
          setSheetOpen(true);
          // Note: prefill not auto-applied. User can adjust in sheet.
          return;
        }
      }

      setPendingParse(data);
      setNeedsPlatform(true);
    } catch {
      setParseError("Failed to process screenshot.");
    } finally {
      setParsing(false);
    }
  }, []);

  const applyPendingParse = (platform: any) => {
    setActivePlatform({ id: platform.id, name: platform.name });
    setSheetOpen(true);
    setPendingParse(null);
    setNeedsPlatform(false);
    setPlatformQuery("");
  };

  const otherFiltered = otherQuery.length > 0
    ? activePlatforms
        .filter((p) =>
          p.name.toLowerCase().includes(otherQuery.toLowerCase()) &&
          !userPlatforms.find((up) => up.platform_id === p.id)
        )
        .slice(0, 6)
    : [];

  const platformQueryFiltered = platformQuery.length > 0
    ? activePlatforms
        .filter((p) => p.name.toLowerCase().includes(platformQuery.toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <>
      <div className="space-y-4">
        {/* Today's total */}
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] rounded-xl p-3.5">
          <p className="text-[10px] text-white/50 uppercase tracking-wider">Logged today</p>
          <p className="text-2xl font-bold text-white">${todayTotal.toFixed(2)}</p>
        </div>

        {/* Tap to log */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
            Tap to log
          </p>
          <div className="flex flex-wrap gap-1.5">
            {userPlatforms.map((p) => (
              <button
                key={p.platform_id}
                onClick={() => openSheetFor(p.platform_id, p.platform_name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  flashId === p.platform_id
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100"
                }`}
              >
                {flashId === p.platform_id ? "✓ Logged" : `+ ${p.platform_name}`}
              </button>
            ))}
            <button
              onClick={() => setShowOther(!showOther)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-500 border border-dashed border-gray-300 hover:border-teal-300 hover:text-teal-600"
            >
              + Other
            </button>
          </div>

          {/* Other platform search */}
          {showOther && (
            <div className="relative mt-2">
              <input
                type="text"
                value={otherQuery}
                onChange={(e) => setOtherQuery(e.target.value)}
                placeholder="Search platforms..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#00C9B1] outline-none"
                autoFocus
                onBlur={() => setTimeout(() => { setShowOther(false); setOtherQuery(""); }, 200)}
              />
              {otherFiltered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {otherFiltered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        openSheetFor(p.id, p.name);
                        setShowOther(false);
                        setOtherQuery("");
                      }}
                      className="w-full px-3 py-2 hover:bg-teal-50 text-left text-sm font-medium text-gray-800"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Screenshot */}
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
            className="w-full py-2.5 border border-dashed border-teal-200 rounded-lg text-xs text-teal-600 font-medium hover:border-teal-400 hover:bg-teal-50 transition-all disabled:opacity-50"
          >
            {parsing ? "⏳ Reading screenshot..." : "📸 Upload Earnings Screenshot"}
          </button>
          {parseError && <p className="text-xs text-red-500 mt-1">{parseError}</p>}
        </div>

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
              {platformQueryFiltered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {platformQueryFiltered.map((p) => (
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

        {/* Recent */}
        {recent.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
              Recent
            </p>
            <div className="space-y-1">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center text-xs py-1.5 px-1"
                >
                  <span className="text-gray-700">
                    <span className="font-medium">{r.platform_name}</span>
                    <span className="text-gray-400"> · {r.date === today ? "today" : new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </span>
                  <span className="text-gray-700 font-medium">${r.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EntrySheet
        open={sheetOpen}
        platform={activePlatform}
        defaultDate={today}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}