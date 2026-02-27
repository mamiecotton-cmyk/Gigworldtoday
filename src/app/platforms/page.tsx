"use client";

import React, { useState, useEffect, useMemo } from "react";
import platformsData from "@/data/platforms.json";
import { matchesSearch } from "@/lib/searchUtils";
import PlatformCard from "@/components/PlatformCard";
import FilterSidebar, { PILL_TO_DATA_CATEGORIES } from "@/components/FilterSidebar";
import { Platform, FilterOptions } from "@/lib/types";

const inactiveStatuses = [
  "absorbed", "merged", "rebranded", "shut_down", "shutdown",
  "permanently_closed", "no_longer_hiring", "not_hiring", "closed",
  "inactive", "defunct", "acquired", "out_of_business", "retired",
  "discontinued", "suspended", "paused", "terminated", "ended",
  "legacy", "archived",
];

// Normalize paymentFrequency values from data into display-friendly groups
const PAY_FREQ_NORMALIZE: Record<string, string> = {
  weekly: "weekly",
  twice_weekly: "twice_weekly",
  daily: "daily",
  instant: "instant",
  instant_or_weekly: "instant",
  within_48_hours: "weekly",
  per_completion: "per_completion",
  varies: "varies",
  "n/a": "n/a",
};

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [filters, setFilters] = useState<FilterOptions>({});

  // Restore scroll position when returning to this page
  useEffect(() => {
    const saved = sessionStorage.getItem("platforms-scroll");
    if (saved) {
      setTimeout(() => window.scrollTo(0, parseInt(saved)), 100);
      sessionStorage.removeItem("platforms-scroll");
    }
  }, []);

  // Load and normalize platforms
  useEffect(() => {
    const normalized = (platformsData as unknown as Platform[]).map((p) => {
      // Normalize vehicle type aliases
      const vehicleTypes = (p.vehicleTypes || []).map((v) => {
        if (v === "none") return "walking";
        if (v === "mid_size" || v === "midsize" || v === "mid-size") return "sedan";
        return v;
      });

      // Normalize paymentFrequency into a clean filter value
      const rawFreq = (p.paymentFrequency || "weekly").toLowerCase();
      const payFrequency = PAY_FREQ_NORMALIZE[rawFreq] || "weekly";

      // Read instantPayAvailable directly from data
      const instantPayAvailable = !!(p as any).instantPayAvailable;

      return {
        ...p,
        vehicleTypes,
        payFrequency,
        instantPayAvailable,
      };
    });

    setPlatforms(normalized);
    setLoading(false);
  }, []);

  // Read search query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || "";
    if (search) setSubmittedQuery(search);
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter platforms
  const filteredPlatforms = useMemo(() => {
    let list = Array.isArray(platforms) ? platforms : [];

    // Text search
    if (submittedQuery.trim()) {
      list = list.filter((p) =>
        matchesSearch(p, submittedQuery.toLowerCase().trim(), platforms)
      );
    } else {
      // No search — show only active platforms
      list = list.filter(
        (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
      );
    }

    // Vehicle filter
    if (filters.vehicles?.length) {
      list = list.filter(
        (p) =>
          p.vehicleTypes &&
          filters.vehicles!.some((v: string) => p.vehicleTypes.includes(v))
      );
    }

    // Category filter — expand pill IDs into underlying data categories
    if (filters.categories?.length) {
      // Build the full set of raw data categories to match against
      const expandedCats = new Set<string>();
      for (const pillId of filters.categories) {
        const dataCats = PILL_TO_DATA_CATEGORIES[pillId];
        if (dataCats) {
          dataCats.forEach((c) => expandedCats.add(c));
        } else {
          // Fallback: treat the pill ID itself as a raw category
          expandedCats.add(pillId);
        }
      }

      list = list.filter(
        (p) =>
          p.categories &&
          p.categories.some((c: string) => expandedCats.has(c))
      );
    }

    // Country filter
    if (filters.countries?.length) {
      list = list.filter(
        (p) =>
          p.countries &&
          filters.countries!.some((c: string) => p.countries.includes(c))
      );
    }

    // Status filter
    if (filters.statuses?.length) {
      list = list.filter(
        (p) => p.driverStatus && filters.statuses!.includes(p.driverStatus)
      );
    }

    // Schedule / delivery type filter
    if (filters.deliveryType) {
      list = list.filter(
        (p) => (p as any).deliveryType === filters.deliveryType
      );
    }

    // Pay frequency filter
    if (filters.payFrequency?.length) {
      list = list.filter(
        (p) =>
          (p as any).payFrequency &&
          filters.payFrequency!.includes((p as any).payFrequency)
      );
    }

    // Instant cash out filter
    if (typeof filters.instantPayout !== "undefined") {
      list = list.filter(
        (p) => !!(p as any).instantPayAvailable === !!filters.instantPayout
      );
    }

    // Availability filter
    if (filters.availability) {
      list = list.filter(
        (p) => (p as any).availability === filters.availability
      );
    }

    return list;
  }, [platforms, submittedQuery, filters]);

  // Sorted platforms derived from filteredPlatforms and sortBy
  const sortedPlatforms = useMemo(() => {
    const list = [...filteredPlatforms];
    switch (sortBy) {
      case "a-z":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "z-a":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return list.sort((a, b) => {
          const aIdx = platforms.findIndex(p => p.id === a.id);
          const bIdx = platforms.findIndex(p => p.id === b.id);
          return bIdx - aIdx;
        });
      case "popular":
        return list.sort((a, b) => {
          const aScore = (a.estimatedHourlyMax || 0) + ((a as any).instantPayAvailable ? 10 : 0) + (a.tipsAllowed ? 5 : 0);
          const bScore = (b.estimatedHourlyMax || 0) + ((b as any).instantPayAvailable ? 10 : 0) + (b.tipsAllowed ? 5 : 0);
          return bScore - aScore;
        });
      default:
        return list;
    }
  }, [filteredPlatforms, sortBy]);

  // Build dynamic filter options from platform data
  const vehicleOptions = useMemo(
    () =>
      Array.from(new Set(platforms.flatMap((p) => p.vehicleTypes || []))).map(
        (v) => ({
          value: v,
          label: v.charAt(0).toUpperCase() + v.slice(1),
        })
      ),
    [platforms]
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(platforms.flatMap((p) => p.categories || []))).map(
        (c) => ({
          value: c,
          label:
            c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " "),
        })
      ),
    [platforms]
  );

  const countryOptions = useMemo(
    () =>
      Array.from(new Set(platforms.flatMap((p) => p.countries || []))).map(
        (c) => ({
          value: c,
          label: c.toUpperCase(),
        })
      ),
    [platforms]
  );

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(platforms.map((p) => p.driverStatus || "").filter(Boolean))
      ).map((s) => ({
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " "),
      })),
    [platforms]
  );

  const deliveryTypeOptions = [
    { value: "on_demand", label: "On Demand" },
    { value: "scheduled", label: "Scheduled" },
    { value: "both", label: "Both" },
  ];

  // Pay frequency options — built from actual normalized values, excluding n/a
  const payFrequencyOptions = useMemo(() => {
    const activePlatforms = platforms.filter(
      (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
    );
    const freqs = new Set(activePlatforms.map((p) => (p as any).payFrequency));

    const LABEL_MAP: Record<string, string> = {
      weekly: "Weekly",
      twice_weekly: "Twice Weekly",
      daily: "Daily",
      instant: "Instant",
      per_completion: "Per Completion",
      varies: "Varies",
    };

    return Array.from(freqs)
      .filter((f) => LABEL_MAP[f])
      .map((f) => ({ value: f, label: LABEL_MAP[f] }))
      .sort((a, b) => {
        const order = ["weekly", "twice_weekly", "daily", "instant", "per_completion", "varies"];
        return order.indexOf(a.value) - order.indexOf(b.value);
      });
  }, [platforms]);

  const availabilityOptions = [
    { value: "24/7", label: "24/7" },
    { value: "daytime", label: "Daytime" },
    { value: "night", label: "Night" },
    { value: "varies", label: "Varies" },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">
        Loading platforms...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">

      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10">

          <div className="flex flex-col lg:flex-row gap-12">

            <aside className="lg:w-1/4">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                vehicleOptions={vehicleOptions}
                categoryOptions={categoryOptions}
                countryOptions={countryOptions}
                statusOptions={statusOptions}
                payFrequencyOptions={payFrequencyOptions}
                deliveryTypeOptions={deliveryTypeOptions}
                availabilityOptions={availabilityOptions}
              />
            </aside>

            <main className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                Browse Platforms
              </h1>

              <div className="flex items-center justify-between mb-8">
                <div className="text-slate-600">
                {submittedQuery ? (
                  sortedPlatforms.length === 0 ? (
                    <>
                      No platforms currently available near{" "}
                      <b>{submittedQuery}</b>.
                    </>
                  ) : (
                    <>
                      Showing {sortedPlatforms.length} platform
                      {sortedPlatforms.length > 1 ? "s" : ""} near{" "}
                      <b>{submittedQuery}</b>.
                    </>
                  )
                ) : (
                  <>Showing all {sortedPlatforms.length} active platforms.</>
                )}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="a-z">A → Z</option>
                  <option value="z-a">Z → A</option>
                  <option value="newest">Newest Added</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Alphabet bar */}
              <div className="flex flex-wrap gap-1.5 sm:gap-1 mb-6 justify-center sm:justify-start">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                  const hasMatch = sortedPlatforms.some((p) => p.name.charAt(0).toUpperCase() === letter);
                  return (
                    <button
                      key={letter}
                      disabled={!hasMatch}
                      onClick={() => {
                        const el = document.getElementById(`letter-${letter}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        hasMatch
                          ? "bg-teal-50 text-teal-700 hover:bg-teal-100 cursor-pointer"
                          : "bg-gray-50 text-gray-300 cursor-default"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {sortedPlatforms.map((platform, idx) => {
                  const firstLetter = platform.name.charAt(0).toUpperCase();
                  const isFirstOfLetter = idx === 0 || sortedPlatforms[idx - 1].name.charAt(0).toUpperCase() !== firstLetter;
                  return (
                    <div key={platform.id} id={isFirstOfLetter ? `letter-${firstLetter}` : undefined} className="scroll-mt-32">
                      <PlatformCard platform={platform} />
                    </div>
                  );
                })}
              </div>
            </main>

          </div>

        </div>
      </div>

    </div>
  );
}