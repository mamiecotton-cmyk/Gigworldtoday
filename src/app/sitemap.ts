import { createServerSupabase } from "@/lib/supabaseServer";

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("articles")
    .select("slug, published_at")
    .eq("published", true)
    .is("deleted_at", null);

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
