import { MetadataRoute } from "next";
import platformsData from "@/data/platforms.json";
import { createServerSupabase } from "@/lib/supabaseServer";

const BASE_URL = "https://www.gigworldtoday.com";

const inactiveStatuses = [
  "absorbed", "merged", "rebranded", "shut_down", "shutdown",
  "permanently_closed", "no_longer_hiring", "not_hiring", "closed",
  "inactive", "defunct", "acquired", "out_of_business", "retired",
  "discontinued", "suspended", "paused", "terminated", "ended",
  "legacy", "archived",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/platforms`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/shop`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/compare`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Platform pages
  const activePlatforms = (platformsData as any[]).filter(
    (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
  );

  const platformPages: MetadataRoute.Sitemap = activePlatforms.map((p) => ({
    url: `${BASE_URL}/platforms/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: p.lastUpdated ? new Date(p.lastUpdated) : undefined,
  }));

  // Blog pages from Supabase
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createServerSupabase();
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, published_at, updated_at")
      .eq("published", true)
      .is("deleted_at", null);

    if (articles) {
      blogPages = articles.map((a) => ({
        url: `${BASE_URL}/blog/${a.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        lastModified: a.updated_at
          ? new Date(a.updated_at)
          : a.published_at
          ? new Date(a.published_at)
          : undefined,
      }));
    }
  } catch (e) {
    console.error("Sitemap: failed to fetch blog articles", e);
  }

  return [...staticPages, ...platformPages, ...blogPages];
}