"use client";
import React, { useState } from "react";
import platformsData from "@/data/platforms.json";
import PlatformComparisonCard, { Platform } from "@/components/PlatformComparisonCard";

const inactiveStatuses = [
  "absorbed", "merged", "rebranded", "shut_down", "shutdown",
  "permanently_closed", "no_longer_hiring", "not_hiring", "closed",
  "inactive", "defunct", "acquired", "out_of_business",
];

const platformOptions: Platform[] = (platformsData as any[])
  .filter((p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase()))
  .map((p) => ({
    name: p.name,
    slug: p.slug,
    logoUrl: p.logoUrl || undefined,
    websiteUrl: p.websiteUrl || undefined,
    categories: p.categories || [],
    estimatedHourlyMin: p.estimatedHourlyMin,
    estimatedHourlyMax: p.estimatedHourlyMax,
    vehicleTypes: p.vehicleTypes || [],
    tipsAllowed: !!p.tipsAllowed,
    paymentFrequency: p.paymentFrequency,
    instantPayAvailable: !!p.instantPayAvailable,
    backgroundCheckRequired: !!p.backgroundCheckRequired,
    minAge: p.minAge,
    deliveryType: p.deliveryType,
    keyFeatures: p.keyFeatures,
    userFeedback: p.userFeedback,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function getHighlightFields(a: Platform, b: Platform) {
  const highlight: { [field: string]: boolean } = {};
  if (!a || !b) return highlight;
  const aAvg = (a.estimatedHourlyMin || 0) + (a.estimatedHourlyMax || 0);
  const bAvg = (b.estimatedHourlyMin || 0) + (b.estimatedHourlyMax || 0);
  if (aAvg > bAvg) highlight.pay = true;
  return highlight;
}

const CompareTool: React.FC = () => {
  const [platformA, setPlatformA] = useState<Platform | null>(null);
  const [platformB, setPlatformB] = useState<Platform | null>(null);

  const availableA = platformOptions.filter((p) => !platformB || p.name !== platformB.name);
  const availableB = platformOptions.filter((p) => !platformA || p.name !== platformA.name);

  return (
    <>
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="platformA" className="block text-sm font-medium text-slate-700 mb-2">Platform A</label>
          <select
            id="platformA"
            className="w-full rounded-lg border border-slate-300 p-2 text-base"
            value={platformA?.name || ""}
            onChange={(e) => {
              const selected = platformOptions.find((p) => p.name === e.target.value);
              setPlatformA(selected || null);
            }}
          >
            <option value="">Select Platform</option>
            {availableA.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="platformB" className="block text-sm font-medium text-slate-700 mb-2">Platform B</label>
          <select
            id="platformB"
            className="w-full rounded-lg border border-slate-300 p-2 text-base"
            value={platformB?.name || ""}
            onChange={(e) => {
              const selected = platformOptions.find((p) => p.name === e.target.value);
              setPlatformB(selected || null);
            }}
          >
            <option value="">Select Platform</option>
            {availableB.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </section>
      {platformA && platformB && (
        <section className="mt-8 grid grid-cols-2 gap-2 sm:gap-6">
          <PlatformComparisonCard platform={platformA} highlight={getHighlightFields(platformA, platformB)} />
          <PlatformComparisonCard platform={platformB} highlight={getHighlightFields(platformB, platformA)} />
        </section>
      )}
    </>
  );
};

export default CompareTool;