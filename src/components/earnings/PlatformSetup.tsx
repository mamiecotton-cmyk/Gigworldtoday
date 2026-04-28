"use client";

import { useEffect, useState } from "react";
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

interface SavedPlatform {
  platform_id: string;
  platform_name: string;
}

interface Props {
  onComplete: () => void;
}

export default function PlatformSetup({ onComplete }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Load existing saved platforms
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("user_platforms")
        .select("platform_id, platform_name")
        .eq("user_id", user.id)
        .order("display_order");

      if (data) setSaved(data);
      setLoading(false);
    };
    load();
  }, []);

  const isFirstRun = !loading && saved.length === 0;

  const filtered = query.length > 0
    ? activePlatforms
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) &&
          !saved.find((s) => s.platform_id === p.id)
        )
        .slice(0, 6)
    : [];

  const addPlatform = async (platform: { id: string; name: string }) => {
    if (!userId) return;
    if (saved.find((s) => s.platform_id === platform.id)) return;

    setBusy(true);
    setError(null);

    const newRow = {
      user_id: userId,
      platform_id: platform.id,
      platform_name: platform.name,
      display_order: saved.length,
    };

    const { error: insertErr } = await supabase
      .from("user_platforms")
      .upsert(newRow, { onConflict: "user_id,platform_id" });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setSaved((prev) => [...prev, { platform_id: platform.id, platform_name: platform.name }]);
      setQuery("");
    }
    setBusy(false);
  };

  const removePlatform = async (platform_id: string) => {
    if (!userId) return;
    setRemovingId(platform_id);
    setError(null);

    const { error: deleteErr } = await supabase
      .from("user_platforms")
      .delete()
      .eq("user_id", userId)
      .eq("platform_id", platform_id);

    if (deleteErr) {
      setError(deleteErr.message);
    } else {
      setSaved((prev) => prev.filter((s) => s.platform_id !== platform_id));
    }
    setRemovingId(null);
  };

  const addCustomPlatform = async () => {
    const name = customName.trim();
    if (!name || !userId) return;
    setBusy(true);
    setError(null);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const platform_id = `custom_${userId.slice(0, 8)}_${slug}`;

    // Add to saved platforms
    const { error: insertErr } = await supabase
      .from("user_platforms")
      .upsert({
        user_id: userId,
        platform_id,
        platform_name: name,
        display_order: saved.length,
      }, { onConflict: "user_id,platform_id" });

    if (insertErr) {
      setError(insertErr.message);
      setBusy(false);
      return;
    }

    // Submit for review (silent — user sees no badge)
    await supabase.from("submitted_platforms").insert({
      user_id: userId,
      name,
    });

    setSaved((prev) => [...prev, { platform_id, platform_name: name }]);
    setCustomName("");
    setShowCustom(false);
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center">
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <img src="/gigsidekick-avatar.png" alt="GigSidekick" className="w-12 h-12 object-contain" />
          <div>
            <p className="text-xs font-bold text-[#00C9B1] uppercase tracking-widest">GigSidekick</p>
            <h1 className="text-lg font-bold text-[#1A1A2E]">
              {isFirstRun ? "Which platforms do you work?" : "Manage your platforms"}
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {isFirstRun ? "Add the platforms you earn on. You can change these later." : "Add or Remove Platforms"}
        </p>

        {/* Saved platforms */}
        {saved.length > 0 && (
          <>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
              Your platforms
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {saved.map((p) => (
                <div
                  key={p.platform_id}
                  className={`flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-full px-3 py-1.5 transition-opacity ${
                    removingId === p.platform_id ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <span className="text-xs font-medium text-teal-700">{p.platform_name}</span>
                  <button
                    onClick={() => removePlatform(p.platform_id)}
                    disabled={removingId === p.platform_id}
                    aria-label={`Remove ${p.platform_name}`}
                    className="text-teal-400 hover:text-red-500 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search to add */}
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
          Add a platform
        </p>
        <div className="relative mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a platform name..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all"
            autoFocus={isFirstRun}
          />
          {filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPlatform({ id: p.id, name: p.name })}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-teal-50 transition-colors text-left"
                >
                  <img
                    src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${p.websiteUrl?.replace(/^https?:\/\//, "").split("/")[0]}&size=32`}
                    alt=""
                    className="w-5 h-5 rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom platform */}
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-all mb-5"
          >
            Don't see your platform? Add it manually
          </button>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
            <p className="text-xs font-medium text-amber-800 mb-2">
              Add a platform we don't have
            </p>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Platform name (e.g., LocalCo Delivery)"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:border-amber-400 outline-none mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && customName.trim()) addCustomPlatform();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={addCustomPlatform}
                disabled={busy || !customName.trim()}
                className="flex-1 py-1.5 bg-[#1A1A2E] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40"
              >
                Add to my list
              </button>
              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomName("");
                }}
                className="px-4 py-1.5 bg-white border border-amber-200 rounded-lg text-xs text-amber-800 hover:bg-amber-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        <button
          onClick={onComplete}
          disabled={isFirstRun && saved.length === 0}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#00C9B1] to-teal-500 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:translate-y-0 transition-all shadow-lg shadow-teal-500/20"
        >
          {isFirstRun ? `Save My Platforms (${saved.length})` : "Done"}
        </button>

        {!isFirstRun && (
          <p className="text-[10px] text-gray-400 text-center mt-3">
            Earnings history is preserved when you remove a platform.
          </p>
        )}

        {error && <p className="text-xs text-red-500 text-center mt-3">{error}</p>}
      </div>
    </div>
  );
}