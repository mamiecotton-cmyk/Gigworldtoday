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

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter platforms based on search + sidebar filters
  const filteredPlatforms = useMemo(() => {
    let list = Array.isArray(platforms) ? platforms : [];

    // Apply search query if present
    if (submittedQuery.trim()) {
      list = list.filter((p) =>
        matchesSearch(p, submittedQuery.toLowerCase().trim(), platforms)
      );
    } else {
      // No search query — show all active platforms
      list = list.filter(
        (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
      );
    }

    // Apply sidebar filters
    if (filters.vehicles && filters.vehicles.length > 0) {
      list = list.filter(
        (p) =>
          p.vehicleTypes &&
          filters.vehicles!.some((v: string) => p.vehicleTypes.includes(v))
      );
    }
    if (filters.categories && filters.categories.length > 0) {
      list = list.filter(
        (p) =>
          p.categories &&
          filters.categories!.some((c: string) => p.categories.includes(c))
      );
    }
    if (filters.countries && filters.countries.length > 0) {
      list = list.filter(
        (p) =>
          p.countries &&
          filters.countries!.some((c: string) => p.countries.includes(c))
      );
    }
    if (filters.statuses && filters.statuses.length > 0) {
      list = list.filter(
        (p) => p.driverStatus && filters.statuses!.includes(p.driverStatus)
      );
    }
    if (filters.deliveryType && filters.deliveryType.length > 0) {
      list = list.filter((p) => (p as any).deliveryType === filters.deliveryType);
    }
    if (filters.availability && filters.availability.length > 0) {
      list = list.filter(
        (p) => (p as any).availability === filters.availability
      );
    }

    return list;
  }, [platforms, submittedQuery, filters]);

  // Build filter options dynamically from platform data
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
          label: c
            .charAt(0)
            .toUpperCase() + c.slice(1).replace(/_/g, " "),
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
    <div className="max-w-6xl mx-auto py-8 px-2 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <div className="md:col-span-1">
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
      </div>

      {/* Platform Grid */}
      <div className="md:col-span-3">
        <div className="mt-4 mb-4 text-gray-500">
          {submittedQuery ? (
            filteredPlatforms.length === 0 ? (
              <>
                No platforms currently available near{" "}
                <b>{submittedQuery}</b>. Check back soon — we&apos;re always
                adding new platforms!
              </>
            ) : (
              <>
                Showing {filteredPlatforms.length} platform
                {filteredPlatforms.length !== 1 && "s"} for{" "}
                <b>{submittedQuery}</b>.
              </>
            )
          ) : (
            <>Showing all {filteredPlatforms.length} active platforms.</>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id || platform.name}
              platform={platform}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
