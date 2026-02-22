"use client";
import React, { useState } from "react";
import platformsData from "@/data/platforms.json";
import PlatformComparisonCard, { Platform } from "@/components/PlatformComparisonCard";

const platformOptions: Platform[] = platformsData.map((p: any) => {
  let calculatedAverage: number | undefined = undefined;
  if (p.estimatedHourlyMin != null && p.estimatedHourlyMax != null) {
    calculatedAverage = (p.estimatedHourlyMin + p.estimatedHourlyMax) / 2;
  }
  return {
    name: p.name,
    logoUrl: p.logoUrl || p.logo || undefined,
    category: p.category,
    averageHourly: p.averageHourly ?? calculatedAverage,
    schedulingType: p.schedulingType,
    vehicleRequired: p.vehicleRequired,
    tipsIncluded: p.tipsIncluded,
    payoutSpeed: p.payoutSpeed,
    signupDifficulty: p.signupDifficulty,
    rating: p.rating,
  };
});

function getHighlightFields(a: Platform, b: Platform) {
  const highlight: { [field: string]: boolean } = {};
  if (!a || !b) return highlight;
  if (a.averageHourly && b.averageHourly) {
    highlight.averageHourly = a.averageHourly > b.averageHourly;
  }
  if (a.rating && b.rating) {
    highlight.rating = a.rating > b.rating;
  }
  return highlight;
}

const CompareTool: React.FC = () => {
  const [platformA, setPlatformA] = useState<Platform | null>(null);
  const [platformB, setPlatformB] = useState<Platform | null>(null);

  const availableA = platformOptions.filter(p => !platformB || p.name !== platformB.name);
  const availableB = platformOptions.filter(p => !platformA || p.name !== platformA.name);

  return (
    <>
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="platformA" className="block text-sm font-medium text-slate-700 mb-2">Platform A</label>
          <select
            id="platformA"
            className="w-full rounded-lg border border-slate-300 p-2 text-base"
            value={platformA?.name || ""}
            onChange={e => {
              const selected = platformOptions.find(p => p.name === e.target.value);
              setPlatformA(selected || null);
            }}
          >
            <option value="">Select Platform</option>
            {availableA.map(p => (
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
            onChange={e => {
              const selected = platformOptions.find(p => p.name === e.target.value);
              setPlatformB(selected || null);
            }}
          >
            <option value="">Select Platform</option>
            {availableB.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </section>
      {platformA && platformB && (
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlatformComparisonCard platform={platformA} highlight={getHighlightFields(platformA, platformB)} />
          <PlatformComparisonCard platform={platformB} highlight={getHighlightFields(platformB, platformA)} />
        </section>
      )}
    </>
  );
};

export default CompareTool;
