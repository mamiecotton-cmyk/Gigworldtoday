"use client";

import React, { useState, useEffect, useMemo } from "react";
import platformsData from "@/data/platforms.json";
import ZIP_TO_CITY from "@/data/zip-to-city";
import US_CITY_TO_STATE from "@/data/us-city-to-state";
import { matchesSearch } from "@/lib/searchUtils";
import PlatformCard from "@/components/PlatformCard";
import { PILL_TO_DATA_CATEGORIES } from "@/components/FilterSidebar";
import { Platform, FilterOptions } from "@/lib/types";

const inactiveStatuses = [
  "absorbed", "merged", "rebranded", "shut_down", "shutdown",
  "permanently_closed", "no_longer_hiring", "not_hiring", "closed",
  "inactive", "defunct", "acquired", "out_of_business", "retired",
  "discontinued", "suspended", "paused", "terminated", "ended",
  "legacy", "archived",
];

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

// Category pills for the dropdown
// Category pills matching PILL_TO_DATA_CATEGORIES keys + new categories
const CATEGORY_PILLS = [
  { value: "food_delivery", label: "Restaurant", group: "Delivery" },
  { value: "grocery_delivery", label: "Grocery", group: "Delivery" },
  { value: "alcohol_delivery", label: "Alcohol", group: "Delivery" },
  { value: "catering_delivery", label: "Catering", group: "Delivery" },
  { value: "package_delivery", label: "Packages", group: "Delivery" },
  { value: "prescription_delivery", label: "Prescription", group: "Delivery" },
  { value: "specialty_courier", label: "Specialty", group: "Delivery" },
  { value: "medical_courier", label: "Medical Courier", group: "Delivery" },
  { value: "retail_delivery", label: "Retail Delivery", group: "Delivery" },
  { value: "rideshare", label: "Rideshare", group: "Services" },
  { value: "task_based", label: "Tasks", group: "Services" },
  { value: "pet_care", label: "Pet Care", group: "Services" },
  { value: "pet_transport", label: "Pet Transport", group: "Services" },
  { value: "moving", label: "Moving", group: "Services" },
  { value: "staffing", label: "Staffing", group: "Services" },
  { value: "hospitality", label: "Hospitality", group: "Services" },
  { value: "retail_audit", label: "Retail Audit", group: "Services" },
  { value: "mystery_shopping", label: "Mystery Shopping", group: "Services" },
  { value: "home_services", label: "Home Services", group: "Services" },
  { value: "vehicle_transport", label: "Vehicle Transport", group: "Services" },
  { value: "errands", label: "Errands", group: "Services" },
  { value: "warehouse", label: "Warehouse", group: "Services" },
];

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const autosuggestions = useMemo(() => {
    const term = searchInput.toLowerCase().trim();
    if (!term || term.length < 2) return [];

    const results: string[] = [];
    const seen = new Set<string>();

    // ZIP code lookup
    if (/^\d{3,5}$/.test(term)) {
      for (const [zip, city] of Object.entries(ZIP_TO_CITY)) {
        if (zip.startsWith(term) && !seen.has(city)) {
          results.push(city);
          seen.add(city);
        }
        if (results.length >= 8) break;
      }
    }

    // City name lookup
    for (const [cityKey, state] of Object.entries(US_CITY_TO_STATE)) {
      if (cityKey.includes(term) && !seen.has(cityKey)) {
        const display = `${cityKey.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}, ${state}`;
        results.push(display);
        seen.add(cityKey);
      }
    }

    // Platform name lookup
    for (const p of platforms) {
      const name = (p.name || "").toLowerCase();
      if (name.includes(term) && !seen.has(name)) {
        results.push(p.name);
        seen.add(name);
      }
    }

    return results.slice(0, 8);
  }, [platforms, searchInput]);

  // Restore scroll position when returning to this page
  useEffect(() => {
    const saved = sessionStorage.getItem("platforms-scroll");
    if (saved) {
      setTimeout(() => window.scrollTo(0, parseInt(saved)), 100);
      sessionStorage.removeItem("platforms-scroll");
    }
  }, []);

  // Show/hide back to top button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-dropdown]")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Load and normalize platforms
  useEffect(() => {
    const normalized = (platformsData as unknown as Platform[]).map((p) => {
      const vehicleTypes = (p.vehicleTypes || []).map((v) => {
        if (v === "none") return "walking";
        if (v === "mid_size" || v === "midsize" || v === "mid-size") return "sedan";
        return v;
      });
      const rawFreq = (p.paymentFrequency || "weekly").toLowerCase();
      const payFrequency = PAY_FREQ_NORMALIZE[rawFreq] || "weekly";
      const instantPayAvailable = !!(p as any).instantPayAvailable;
      return { ...p, vehicleTypes, payFrequency, instantPayAvailable };
    });
    setPlatforms(normalized);
    setLoading(false);
  }, []);

  // Read search query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || "";
    if (search) {
      setSubmittedQuery(search);
      setSearchInput(search);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Enforce autocomplete-only: if input doesn't match a suggestion, use first suggestion
    if (autosuggestions.length > 0) {
      const exactMatch = autosuggestions.find(s => s.toLowerCase() === searchInput.toLowerCase().trim());
      const selected = exactMatch || autosuggestions[0];
      setSearchInput(selected);
      setSubmittedQuery(selected);
      setShowSuggestions(false);
    }
    // If no suggestions, don't submit — input doesn't match any known data
  };

  // Filter platforms
  const filteredPlatforms = useMemo(() => {
    let list = Array.isArray(platforms) ? platforms : [];

    if (submittedQuery.trim()) {
      list = list.filter((p) =>
        matchesSearch(p, submittedQuery.toLowerCase().trim(), platforms)
      );
    } else {
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

    // Category filter
    if (filters.categories?.length) {
      const expandedCats = new Set<string>();
      for (const pillId of filters.categories) {
        const dataCats = PILL_TO_DATA_CATEGORIES[pillId];
        if (dataCats) {
          dataCats.forEach((c) => expandedCats.add(c));
        } else {
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

    // 18+ filter (platforms that don't require age 21+)
    if ((filters as any).minAge18) {
      list = list.filter((p) => !p.minAge || p.minAge <= 18);
    }

    return list;
  }, [platforms, submittedQuery, filters]);

  // Sorted platforms
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

  // Vehicle options from data
  const vehicleOptions = useMemo(
    () =>
      Array.from(new Set(platforms.flatMap((p) => p.vehicleTypes || []))).map(
        (v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ") })
      ),
    [platforms]
  );

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.vehicles?.length) count++;
    if (filters.categories?.length) count++;
    if (filters.payFrequency?.length) count++;
    if (typeof filters.instantPayout !== "undefined") count++;
    if (filters.deliveryType) count++;
    if ((filters as any).minAge18) count++;
    return count;
  }, [filters]);

  const toggleFilter = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => {
      const current = (prev[key] as string[]) || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next.length ? next : undefined };
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSubmittedQuery("");
    setSearchInput("");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">
        Loading platforms...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto px-6 py-14 sm:py-20 relative">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide uppercase mb-4">
              {platforms.filter(p => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())).length}+ Active Platforms
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Find Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                Gig Platform
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              Compare earnings, requirements, and pay schedules — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  autoComplete="off"
                  placeholder="Search platforms by name, category, or location..."
                  className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(""); setSubmittedQuery(""); setShowSuggestions(false); }}
                    className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Search
                </button>

                {showSuggestions && autosuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {autosuggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-gray-800 text-sm"
                        onMouseDown={() => {
                          setSearchInput(suggestion);
                          setSubmittedQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filter Bar + Content */}
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Filter Row */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-4 sm:px-6 py-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Gig Type Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "category" ? null : "category"); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filters.categories?.length ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Gig Type{filters.categories?.length ? ` (${filters.categories.length})` : ""}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {openDropdown === "category" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50 max-h-64 overflow-y-auto" data-dropdown>
                  {["Delivery", "Services"].map((group) => (
                    <div key={group}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 pt-2 pb-1">{group}</p>
                      {CATEGORY_PILLS.filter((c) => c.group === group).map((cat) => (
                        <label key={cat.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={filters.categories?.includes(cat.value) || false}
                            onChange={() => toggleFilter("categories", cat.value)}
                            className="rounded border-gray-300 text-teal-500 focus:ring-teal-400"
                          />
                          {cat.label}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "vehicle" ? null : "vehicle"); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filters.vehicles?.length ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Vehicle{filters.vehicles?.length ? ` (${filters.vehicles.length})` : ""}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {openDropdown === "vehicle" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50 max-h-64 overflow-y-auto" data-dropdown>
                  {vehicleOptions.map((v) => (
                    <label key={v.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm capitalize">
                      <input
                        type="checkbox"
                        checked={filters.vehicles?.includes(v.value) || false}
                        onChange={() => toggleFilter("vehicles", v.value)}
                        className="rounded border-gray-300 text-teal-500 focus:ring-teal-400"
                      />
                      {v.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Pay Frequency Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "pay" ? null : "pay"); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filters.payFrequency?.length ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Pay Frequency{filters.payFrequency?.length ? ` (${filters.payFrequency.length})` : ""}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {openDropdown === "pay" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50" data-dropdown>
                  {[
                    { value: "weekly", label: "Weekly" },
                    { value: "twice_weekly", label: "Twice Weekly" },
                    { value: "daily", label: "Daily" },
                    { value: "instant", label: "Instant" },
                    { value: "per_completion", label: "Per Completion" },
                  ].map((f) => (
                    <label key={f.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={filters.payFrequency?.includes(f.value) || false}
                        onChange={() => toggleFilter("payFrequency", f.value)}
                        className="rounded border-gray-300 text-teal-500 focus:ring-teal-400"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 18+ Only Toggle */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  minAge18: prev.minAge18 === undefined ? true : undefined,
                }))
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                (filters as any).minAge18 ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Age 18+
            </button>

            {/* Instant Pay Toggle */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  instantPayout: prev.instantPayout === undefined ? true : undefined,
                }))
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filters.instantPayout ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              Instant Pay
            </button>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            )}

            {/* Sort - pushed to right */}
            <div className="ml-auto">
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
          </div>
        </div>

        {/* Results Info + Alphabet Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 text-sm">
              {submittedQuery ? (
                sortedPlatforms.length === 0 ? (
                  <>No platforms found for <b>{submittedQuery}</b>.</>
                ) : (
                  <>Showing {sortedPlatforms.length} platform{sortedPlatforms.length > 1 ? "s" : ""} for <b>{submittedQuery}</b>.</>
                )
              ) : (
                <>Showing all {sortedPlatforms.length} active platforms.</>
              )}
            </p>
          </div>

          {/* Alphabet bar */}
          <div className="flex flex-wrap gap-1.5 sm:gap-1 justify-center sm:justify-start">
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
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {sortedPlatforms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No platforms match your filters.</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
        {/* Back to Top */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 bg-teal-500 hover:bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label="Back to top"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}