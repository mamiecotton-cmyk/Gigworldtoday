import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number | null;
  category_id: string | null;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const categorySlug = searchParams?.category;

  let query = supabase
    .from("articles")
    .select(`
      *,
      categories ( slug )
    `)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  const { data } = await query;

  const articles: Article[] = (data ?? []) as Article[];

  return (
    <div className="space-y-16">

      {articles.map((article) => (
        <Link key={article.id} href={`/blog/${article.slug}`} className="block group">
          <div className="border-b border-neutral-200 pb-12">

            {article.featured_image && (
              <div className="relative h-72 w-full mb-6">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <h2 className="text-2xl font-semibold tracking-tight group-hover:underline">
              {article.title}
            </h2>

            {article.excerpt && (
              <p className="mt-4 text-neutral-600 max-w-2xl">
                {article.excerpt}
              </p>
            )}

            <div className="mt-4 flex gap-6 text-sm text-neutral-500">
              {article.published_at && (
                <span>
                  {new Date(article.published_at).toLocaleDateString()}
                </span>
              )}
              {article.reading_time && (
                <span>{article.reading_time} min read</span>
              )}
            </div>

          </div>
        </Link>
      ))}

      {articles.length === 0 && (
        <p className="text-neutral-500">
          No articles found in this category.
        </p>
      )}

    </div>
  );
}