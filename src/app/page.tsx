"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GigSidekickChat from "@/components/GigSidekickChat";
import platformsData from "@/data/platforms.json";
import ZIP_TO_CITY from "@/data/zip-to-city";
import US_CITY_TO_STATE from "@/data/us-city-to-state";
import { CITY_TO_STATE } from "@/lib/searchUtils";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

async function getTopRated() {
  const { data } = await supabase
    .from("platform_ratings")
    .select("*")
    .order("average_rating", { ascending: false })
    .limit(3);
  return data || [];
}

export default function HomePage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntered(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  /* ===============================
     COLLAPSE CONTROLLER
  =============================== */
  const triggerCollapse = () => {
    if (collapsed || exiting) return;

    setExiting(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        setCollapsed(true);
        setExiting(false);
      }, 1800); // natural readable timing
    });
  };

  /* Collapse when user types */
  useEffect(() => {
    if (searchTerm.length > 0 && !collapsed) {
      triggerCollapse();
    }
  }, [searchTerm]);

  /* ===============================
     SEARCH HANDLER
  =============================== */
  const handleSearch = (location: string, vehicle: string) => {
    triggerCollapse();

    setTimeout(() => {
      const params = new URLSearchParams();
      if (location) params.set("search", location);
      if (vehicle) params.set("vehicles", vehicle);
      router.push(`/platforms?${params.toString()}`);
    }, 1000);
  };

  /* ===============================
     PLATFORM STATS
  =============================== */
  // Only show platforms that are not no_longer_hiring, rebranded, or permanently_closed in the homepage directory
  const platforms = platformsData.filter(
    (p: any) => !["no_longer_hiring", "rebranded", "permanently_closed"].includes(p.driverStatus)
  );
  const totalPlatforms = platforms.length;
  const activePlatforms = platforms.filter(
    (p: any) => p.driverStatus === "active"
  );
  const totalOpportunities = activePlatforms.length;

  const payValues: number[] = [];
  activePlatforms.forEach((p: any) => {
    if (typeof p.estimatedHourlyMin === "number" &&
        typeof p.estimatedHourlyMax === "number") {
      payValues.push(
        (p.estimatedHourlyMin + p.estimatedHourlyMax) / 2
      );
    }
  });

  const avgGigPay =
    payValues.length > 0
      ? payValues.reduce((a, b) => a + b, 0) / payValues.length
      : 0;

  /* ===============================
     AUTOSUGGESTIONS
  =============================== */
  const autosuggestions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term || term.length < 2) return [];

    const results: string[] = [];
    const seen = new Set<string>();

    if (/^\d{3,5}$/.test(term)) {
      for (const [zip, city] of Object.entries(ZIP_TO_CITY)) {
        if (zip.startsWith(term) && !seen.has(city)) {
          results.push(city);
          seen.add(city);
        }
        if (results.length >= 8) break;
      }
    }

    for (const [cityKey, state] of Object.entries(US_CITY_TO_STATE)) {
      if (cityKey.includes(term) && !seen.has(cityKey)) {
        const display =
          `${cityKey
            .split(" ")
            .map(w => w[0].toUpperCase() + w.slice(1))
            .join(" ")}, ${state}`;
        results.push(display);
        seen.add(cityKey);
      }
    }

    for (const p of platforms) {
      const name = (p.name || "").toLowerCase();
      if (name.includes(term) && !seen.has(name)) {
        results.push(p.name);
        seen.add(name);
      }
    }

    return results.slice(0, 8);
  }, [platforms, searchTerm]);

  /* ===============================
     RENDER
  =============================== */

  const [topRated, setTopRated] = useState<any[]>([]);

  useEffect(() => {
    getTopRated().then((data) => {
      console.log("TOP RATED DATA:", data);
      setTopRated(data);
    });
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
              {/* TOP RATED PLATFORMS SECTION */}
              <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold mb-8">
                  Top Rated Platforms
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {topRated.map((platform) => (
                    <div
                      key={platform.platform_slug}
                      className="p-6 border rounded-lg"
                    >
                      <h3 className="text-xl font-semibold mb-2">
                        {platform.platform_slug.replace("-", " ")}
                      </h3>

                      <p className="text-2xl font-bold">
                        ⭐ {Number(platform.average_rating).toFixed(1)}
                      </p>

                      <p className="text-sm text-gray-500">
                        {platform.rating_count} ratings
                      </p>

                      <Link
                        href={`/platforms/${platform.platform_slug}`}
                        className="text-blue-600 mt-4 inline-block"
                      >
                        View Platform →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/90 z-0" />
        <div className="absolute inset-0 z-0">
          <Image
            src="/city-background.jpg"
            alt="City"
            fill
            className="object-cover brightness-[0.6]"
            priority
          />
        </div>

        <div className="relative z-10 container mx-auto px-8 py-24 flex flex-row items-center justify-between w-full">
          {/* LEFT CONTENT - MODERNIZED */}
          <div className="relative z-10 max-w-2xl w-full">
            <div className="absolute -left-20 -top-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
              The Hub for Modern Gig Workers
            </h1>

            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Discover platforms. Track changes. Maximize earnings.
            </p>

            <div className="mb-6">
              <Link href="/blog" className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition">
                Read the Blog
              </Link>
            </div>

            {/* SEARCH FORM (KEEP EXISTING LOGIC) */}
            <form
              className="flex items-center w-full max-w-md bg-white/95 rounded-xl shadow-2xl p-2 gap-2 border border-white/30 backdrop-blur-md"
              onSubmit={e => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  triggerCollapse();
                  router.push(`/platforms?search=${encodeURIComponent(searchTerm.trim())}`);
                }
              }}
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg text-base text-gray-800 placeholder-gray-400 outline-none border-none bg-transparent"
                  placeholder="Enter city, ZIP, or platform..."
                  value={searchTerm}
                  autoComplete="off"
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />

                {showSuggestions && autosuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {autosuggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-gray-800 text-sm"
                        onMouseDown={() => {
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                          router.push(`/platforms?search=${encodeURIComponent(suggestion)}`);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-lg"
              >
                Search
              </button>
            </form>

            <p className="text-white/70 text-sm mt-4">
              Built by a working gig driver for fellow gig workers.
            </p>
          </div>
        </div>
      </section>

      {/* DIRECTORY SECTION */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-10">Explore Gig Platforms</h2>
            <span className="text-sm text-gray-500">{totalPlatforms} Platforms Listed</span>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {platforms.slice(0, 6).map((platform: any, idx: number) => (
              <div
                key={idx}
                className="group border border-gray-100 rounded-2xl p-6 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-2xl transition duration-300" />
                <h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
                <div className="text-sm text-gray-500 mb-3">{platform.category || "Gig Platform"}</div>
                <div className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-semibold ${
                  platform.driverStatus === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : platform.driverStatus === "limited"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {platform.driverStatus || "Unknown"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW SECTION */}
      <section className="bg-black py-20">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">Gig Insights & Platform Updates</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map((item) => (
              <div key={item} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition duration-300">
                <h3 className="font-semibold mb-2 text-white">Platform Update Example</h3>
                <p className="text-sm text-gray-300 leading-relaxed">Changes, strategies, and earnings insights for gig workers.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS / PRODUCTS SECTION */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold mb-8">Tools to Boost Your Gig</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map((item) => (
              <div key={item} className="border border-gray-100 p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 mb-4" />
                <h3 className="font-semibold mb-2">Recommended Tool</h3>
                <p className="text-sm text-gray-500">Gear and apps that help maximize earnings.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMAIL CAPTURE SECTION */}
      <section className="relative bg-black py-24 text-white overflow-hidden">
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-8 text-center relative">
          <h2 className="text-3xl font-bold mb-4">Stay Ahead of Platform Changes</h2>
          <p className="text-white/70 mb-6">Join gig workers getting updates and earning strategies.</p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-xl text-black outline-none"
            />
            <button className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 rounded-r-xl font-semibold hover:opacity-90 transition shadow-lg">Join</button>
          </div>
        </div>
      </section>

      {/* ASSISTANT */}
      <div>
        {!collapsed ? (
          <div
            className={`fixed bottom-32 right-12 z-50 transition-all duration-700 ease-out ${
              collapsed
                ? "opacity-0 translate-y-6 pointer-events-none"
                : entered
                  ? "translate-x-0 opacity-100"
                  : "translate-x-32 opacity-0"
            }`}
            style={{ display: "flex", alignItems: "flex-end", gap: 16 }}
          >
            <Image
              src="/gigsidekick-avatar.png"
              alt="GigSidekick"
              width={200}
              height={400}
              className="select-none pointer-events-none"
            />

            <div
              className="transition-all duration-300"
              style={{ width: 260, marginLeft: -32, marginBottom: 32 }}
            >
              <GigSidekickChat
                exiting={exiting}
                handleSearch={handleSearch}
              />
            </div>
          </div>
        ) : (
          <button
            className="fixed bottom-32 right-12 z-50 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border"
            onClick={() => {
              setCollapsed(false);
              setEntered(false);
              setTimeout(() => setEntered(true), 50);
            }}
          >
            <Image
              src="/gigsidekick-avatar.png"
              alt="GigSidekick"
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
            />
          </button>
        )}
      </div>
    </div>
  );
}