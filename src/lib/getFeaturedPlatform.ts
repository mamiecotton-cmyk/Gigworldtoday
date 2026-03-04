import { createServerSupabase } from "@/lib/supabaseServer";

export type FeaturedPlatform = {
  name: string;
  category: string;
  pay_model: string;
  typical_pay: string;
  description: string;
  slug: string;
};

/**
 * Get the "Featured Gig of the Week" platform.
 *
 * Selection logic:
 * 1. Pick the platform with the oldest `featured_last_date` (least recently featured)
 * 2. If no platform has been featured yet (all NULL), pick one at random
 *
 * After selection, updates `featured_last_date` to now().
 */
export async function getFeaturedPlatform(): Promise<FeaturedPlatform | null> {
  const supabase = createServerSupabase();

  // Try to get the platform with the oldest featured_last_date (NULLS first = never featured)
  let { data: platform, error } = await supabase
    .from("platforms")
    .select("slug, name, description, categories, pay_model, estimated_hourly_min, estimated_hourly_max")
    .order("featured_last_date", { ascending: true, nullsFirst: true })
    .limit(1)
    .single();

  if (error || !platform) {
    // Fallback: pick a random platform
    const { data: allPlatforms } = await supabase
      .from("platforms")
      .select("slug, name, description, categories, pay_model, estimated_hourly_min, estimated_hourly_max");

    if (!allPlatforms || allPlatforms.length === 0) return null;

    platform = allPlatforms[Math.floor(Math.random() * allPlatforms.length)];
  }

  // Update featured_last_date to now
  await supabase
    .from("platforms")
    .update({ featured_last_date: new Date().toISOString() })
    .eq("slug", platform.slug);

  // Build typical_pay string
  const min = platform.estimated_hourly_min;
  const max = platform.estimated_hourly_max;
  const typical_pay =
    min && max
      ? `$${min}–$${max}/hr`
      : min
      ? `$${min}+/hr`
      : "Varies";

  // Use first category as the display category
  const category =
    Array.isArray(platform.categories) && platform.categories.length > 0
      ? platform.categories[0].replace(/_/g, " ")
      : "Gig Platform";

  return {
    name: platform.name,
    category,
    pay_model: platform.pay_model || "varies",
    typical_pay,
    description: platform.description || "",
    slug: platform.slug,
  };
}
