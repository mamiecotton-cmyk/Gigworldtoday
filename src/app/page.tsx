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
  const [latestArticles, setLatestArticles] = useState<any[]>([]);

  useEffect(() => {
    getTopRated().then((data) => {
      console.log("TOP RATED DATA:", data);
      setTopRated(data);
    });
  }, []);

  useEffect(() => {
    supabase
      .from("articles")
      .select("title, slug, featured_image, excerpt, published_at")
      .eq("published", true)
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setLatestArticles(data || []));
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
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

        <div className="relative z-10 container mx-auto px-8 py-16 flex flex-row items-center justify-between w-full">
          <div className="relative z-10 max-w-2xl w-full">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-white tracking-tight">
              The Hub for Modern Gig Workers
            </h1>

            <p className="text-lg text-gray-300 mb-5 leading-relaxed">
              Discover platforms. Track changes. Maximize earnings.
            </p>

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

            <p className="text-white/70 text-sm mt-3">
              Built by a working gig driver for fellow gig workers.
            </p>
          </div>
        </div>
      </section>

      {/* TOP RATED PLATFORMS */}
      {topRated.length > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-8">
            <h2 className="text-2xl font-bold mb-6">⭐ Top Rated Platforms</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {topRated.map((tr: any) => {
                const p = platforms.find((x: any) => x.slug === tr.platform_slug || x.id === tr.platform_slug);
                const LOCAL: Record<string, string> = {
                  doordash: '/logos/doordash.svg', ubereats: '/logos/ubereats.svg',
                  instacart: '/logos/instacart.svg', uber: '/logos/uber.svg',
                  lyft: '/logos/lyft.svg', thumbtack: '/logos/thumbtack.svg',
                };
                const DOMS: Record<string, string> = {
                  doordash: 'doordash.com', ubereats: 'ubereats.com',
                };
                let domain = (p && DOMS[p.id]) || null;
                if (!domain && p?.websiteUrl) {
                  try { const h = new URL(p.websiteUrl).hostname.replace(/^www\./,'').split('.'); domain = h.length > 2 ? h.slice(-2).join('.') : h.join('.'); } catch {}
                }
                const logoSrc = (p && LOCAL[p.id]) || (domain ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128` : null);

                return (
                  <Link
                    key={tr.platform_slug}
                    href={`/platforms/${tr.platform_slug}`}
                    className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-lg hover:border-teal-300 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {logoSrc ? (
                        <img src={logoSrc} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-lg font-bold text-teal-600">{tr.platform_slug.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors capitalize">
                        {p?.name || tr.platform_slug.replace(/-/g, " ")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ⭐ {Number(tr.average_rating).toFixed(1)} · {tr.rating_count} ratings
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* DIRECTORY SECTION */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Explore Gig Platforms</h2>
            <span className="text-sm text-gray-500">{totalPlatforms} Platforms Listed</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {platforms.slice(0, 6).map((platform: any, idx: number) => {
              const LOCAL: Record<string, string> = {
                doordash: '/logos/doordash.svg', ubereats: '/logos/ubereats.svg',
                instacart: '/logos/instacart.svg', uber: '/logos/uber.svg',
                lyft: '/logos/lyft.svg', thumbtack: '/logos/thumbtack.svg',
              };
              const DOMS: Record<string, string> = {
                doordash: 'doordash.com', ubereats: 'ubereats.com',
              };
              let domain = DOMS[platform.id] || null;
              if (!domain && platform.websiteUrl) {
                try { const h = new URL(platform.websiteUrl).hostname.replace(/^www\./,'').split('.'); domain = h.length > 2 ? h.slice(-2).join('.') : h.join('.'); } catch {}
              }
              const logoSrc = LOCAL[platform.id] || (domain ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128` : null);
              const category = Array.isArray(platform.categories) && platform.categories.length > 0
                ? platform.categories[0].replace(/_/g, ' ')
                : 'Gig Platform';

              return (
                <Link
                  key={idx}
                  href={`/platforms/${platform.slug}`}
                  className="group relative border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-gradient-to-r from-teal-400 to-teal-500" />
                  <div className="flex items-center gap-3 mt-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-lg font-bold text-teal-600">{platform.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{platform.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{category}</p>
                    </div>
                  </div>
                  {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-full px-3 py-1 text-sm mb-3 w-fit">
                      ${platform.estimatedHourlyMin}–${platform.estimatedHourlyMax}/hr estimated
                    </span>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{platform.description}</p>
                  <span className="block w-full text-center bg-orange-500 group-hover:bg-orange-600 text-white font-semibold rounded-lg px-5 py-2.5 transition-colors mt-auto">
                    View Details →
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/platforms" className="inline-block px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition">
              Browse All {totalPlatforms} Platforms →
            </Link>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW SECTION */}
      <section className="bg-black py-16">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Gig Insights & Platform Updates</h2>
            <Link href="/blog" className="text-teal-400 hover:text-teal-300 text-sm font-semibold">
              View All Articles →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestArticles.length > 0 ? latestArticles.map((article: any) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition duration-300"
              >
                {article.featured_image && (
                  <div className="relative h-[160px] w-full overflow-hidden">
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{article.excerpt}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </Link>
            )) : (
              <p className="text-gray-500 col-span-3 text-center py-8">No articles published yet.</p>
            )}
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