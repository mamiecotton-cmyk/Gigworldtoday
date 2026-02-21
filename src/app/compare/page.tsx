import React, { useState } from "react";
import type { Metadata } from "next";
import platformsData from "@/data/platforms.json";
import PlatformComparisonCard, { Platform } from "@/components/PlatformComparisonCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compare Gig Apps | GigWorldToday",
  description: "Compare Uber, DoorDash, Spark, Instacart and more before signing up.",
};

const platformOptions: Platform[] = platformsData.map((p: any) => ({
  name: p.name,
  logoUrl: p.logoUrl || p.logo || undefined,
  category: p.category,
  averageHourly: p.averageHourly ?? p.estimatedHourlyMin && p.estimatedHourlyMax ? (p.estimatedHourlyMin + p.estimatedHourlyMax) / 2 : undefined,
  schedulingType: p.schedulingType,
  vehicleRequired: p.vehicleRequired,
  tipsIncluded: p.tipsIncluded,
  payoutSpeed: p.payoutSpeed,
  signupDifficulty: p.signupDifficulty,
  rating: p.rating,
}));

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

export default function ComparePage() {
  const [platformA, setPlatformA] = useState<Platform | null>(null);
  const [platformB, setPlatformB] = useState<Platform | null>(null);

  const availableA = platformOptions.filter(p => !platformB || p.name !== platformB.name);
  const availableB = platformOptions.filter(p => !platformA || p.name !== platformA.name);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Gig Earnings Comparison Tool</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Compare Gig Platforms</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">See how platforms stack up before you sign up.</p>
      </section>
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
    </main>
  );
}
