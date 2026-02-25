"use client";

import React, { useState, useEffect, useMemo } from "react";
import platformsData from "@/data/platforms.json";
import { matchesSearch } from "@/lib/searchUtils";
import PlatformCard from "@/components/PlatformCard";
import FilterSidebar from "@/components/FilterSidebar";
import { Platform, FilterOptions } from "@/lib/types";

const inactiveStatuses = [
  "absorbed", "merged", "rebranded", "shut_down", "shutdown",
  "permanently_closed", "no_longer_hiring", "not_hiring", "closed",
  "inactive", "defunct", "acquired", "out_of_business", "retired",
  "discontinued", "suspended", "paused", "terminated", "ended",
  "legacy", "archived",
];

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  // Load platforms
  useEffect(() => {
    setPlatforms(platformsData as unknown as Platform[]);
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

    if (submittedQuery.trim()) {
      list = list.filter((p) =>
        matchesSearch(p, submittedQuery.toLowerCase().trim(), platforms)
      );
    } else {
      list = list.filter(
        (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
      );
    }

    if (filters.vehicles?.length) {
      list = list.filter(
        (p) =>
          p.vehicleTypes &&
          filters.vehicles!.some((v: string) => p.vehicleTypes.includes(v))
      );
    }

    if (filters.categories?.length) {
      list = list.filter(
        (p) =>
          p.categories &&
          filters.categories!.some((c: string) => p.categories.includes(c))
      );
    }

    if (filters.countries?.length) {
      list = list.filter(
        (p) =>
          p.countries &&
          filters.countries!.some((c: string) => p.countries.includes(c))
      );
    }

    if (filters.statuses?.length) {
      list = list.filter(
        (p) => p.driverStatus && filters.statuses!.includes(p.driverStatus)
      );
    }

    if (filters.deliveryType) {
      list = list.filter(
        (p) => (p as any).deliveryType === filters.deliveryType
      );
    }

    if (filters.availability) {
      list = list.filter(
        (p) => (p as any).availability === filters.availability
      );
    }

    return list;
  }, [platforms, submittedQuery, filters]);

  // Build dynamic filter options (UNCHANGED)
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
          label: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " "),
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
                deliveryTypeOptions={deliveryTypeOptions}
                availabilityOptions={availabilityOptions}
              />
            </aside>

            <main className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                Browse Platforms
              </h1>

              <div className="mb-8 text-slate-600">
                {submittedQuery ? (
                  filteredPlatforms.length === 0 ? (
                    <>
                      No platforms currently available near{" "}
                      <b>{submittedQuery}</b>.
                    </>
                  ) : (
                    <>
                      Showing {filteredPlatforms.length} platform
                      {filteredPlatforms.length > 1 ? "s" : ""} near{" "}
                      <b>{submittedQuery}</b>.
                    </>
                  )
                ) : (
                  <>Showing all {filteredPlatforms.length} active platforms.</>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredPlatforms.map((platform) => (
                  <PlatformCard key={platform.id} platform={platform} />
                ))}
              </div>
            </main>

          </div>

        </div>
      </div>

    </div>
  );
}