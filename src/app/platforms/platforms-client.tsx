"use client";

import React, { useMemo, useState, useEffect } from "react";
import PlatformCard from "@/components/PlatformCard";
import SearchBar from "@/components/SearchBar";
import type { Category } from "@/lib/types";

// Helper: Extract city array from regions.USA.cities
function getPlatformCities(p: any): string[] {
  if (p.regions && p.regions.USA && Array.isArray(p.regions.USA.cities)) {
    return p.regions.USA.cities;
  }
  return [];
}

type PlatformsClientProps = {
  platforms: any[];
  categories: Category[];
};

const PlatformsClient: React.FC<PlatformsClientProps> = ({ platforms, categories }) => {
  const [searchInput, setSearchInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const searchTermRaw = (searchInput || "").trim().toLowerCase();

  const autosuggestions = useMemo(() => {
    if (!Array.isArray(platforms) || !searchTermRaw) return [];
    const allCities = platforms.flatMap(p => getPlatformCities(p)).filter(Boolean);
    const allStates = platforms.map(p => p.state || "").filter(Boolean);
    const allSuggestions = [...allCities, ...allStates].map(s => s.trim());
    const uniqueSuggestions = Array.from(
      new Set(allSuggestions.map(s => s.toLowerCase()))
    ).map(val => allSuggestions.find(orig => orig.toLowerCase() === val) || val);

    return uniqueSuggestions
      .filter(s => s.toLowerCase().includes(searchTermRaw))
      .slice(0, 7);
  }, [platforms, searchTermRaw]);

  // Reset submission state when search input is cleared
  useEffect(() => {
    if (!searchInput) setIsSubmitted(false);
  }, [searchInput]);

  // Only show matching on submit
  const filteredPlatforms = useMemo(() => {
    if (!Array.isArray(platforms) || !searchInput || !isSubmitted) return [];
    const query = searchInput.trim().toLowerCase();
    return platforms.filter(p => {
      const cities = getPlatformCities(p).map((c: string) => c.toLowerCase());
      const state = (p.state || "").toLowerCase();
      return (
        cities.some(city => city.includes(query)) ||
        state.includes(query)
      );
    });
  }, [platforms, searchInput, isSubmitted]);

  const sortedPlatforms = useMemo(
    () => [...filteredPlatforms].sort((a, b) =>
      (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
    ),
    [filteredPlatforms]
  );

  // Handles ENTER or clicking search button (if your SearchBar supports onSubmit)
  const handleSearch = (value: string) => {
    setSearchInput(value);
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-black font-sans pt-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Platforms Page</h1>
        <p className="text-lg text-white/80 mb-2">Total platforms: {platforms.length}</p>
        <p className="text-lg text-white/80 mb-8">Total categories: {categories.length}</p>
        <form onSubmit={e => { e.preventDefault(); setIsSubmitted(true); }}>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by city or state..."
          />
          <button type="submit" style={{ display: "none" }} aria-hidden="true" tabIndex={-1}></button>
        </form>
        {isSubmitted && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {sortedPlatforms.map((platform: any) => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
            {sortedPlatforms.length === 0 && (
              <div className="col-span-full text-white/70 mt-4">No matching platforms for "{searchInput}".</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default PlatformsClient;