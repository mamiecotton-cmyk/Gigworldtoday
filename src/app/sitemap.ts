import { supabase } from "@/lib/supabaseClient";

export default async function sitemap() {
  const { data } = await supabase
    .from("articles")
    .select("slug, published_at")
    .eq("published", true);

  const articleUrls =
    data?.map((article) => ({
      url: `https://gigworldtoday.com/blog/${article.slug}`,
      lastModified: article.published_at,
    })) ?? [];

  return [
    {
      url: "https://gigworldtoday.com",
      lastModified: new Date(),
    },
    ...articleUrls,
  ];
}
