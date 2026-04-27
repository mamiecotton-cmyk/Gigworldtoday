"use client";

import { useState } from "react";
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

interface Props {
  onComplete: () => void;
}

export default function PlatformSetup({ onComplete }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const filtered = query.length > 0
    ? activePlatforms.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const addPlatform = (platform: any) => {
    if (!selected.find((p) => p.id === platform.id)) {
      setSelected((prev) => [...prev, platform]);
    }
    setQuery("");
  };

  const removePlatform = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const save = async () => {
    if (selected.length === 0) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = selected.map((p, i) => ({
      user_id: user.id,
      platform_id: p.id,
      platform_name: p.name,
      display_order: i,
    }));

    await supabase.from("user_platforms").upsert(rows, {
      onConflict: "user_id,platform_id",
    });

    setSaving(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <img src="/gigsidekick-avatar.png" alt="GigSidekick" className="w-14 h-14 object-contain" />
          <div>
            <p className="text-xs font-bold text-[#00C9B1] uppercase tracking-widest">GigSidekick</p>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Which platforms do you work?</h1>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Add the platforms you drive for. You can always add more later.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a platform name..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all"
            autoFocus
          />

          {/* Dropdown */}
          {filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPlatform(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left"
                >
                  <img
                    src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${p.websiteUrl?.replace(/^https?:\/\//, "").split("/")[0]}&size=32`}
                    alt={p.name}
                    className="w-6 h-6 rounded object-contain"
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

        {/* Selected platforms */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selected.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-1.5"
              >
                <span className="text-sm font-medium text-teal-700">{p.name}</span>
                <button
                  onClick={() => removePlatform(p.id)}
                  className="text-teal-400 hover:text-red-500 transition-colors text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={save}
          disabled={selected.length === 0 || saving}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#00C9B1] to-teal-500 hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-teal-500/20"
        >
          {saving ? "Saving..." : `Save My Platforms (${selected.length})`}
        </button>
      </div>
    </div>
  );
}
