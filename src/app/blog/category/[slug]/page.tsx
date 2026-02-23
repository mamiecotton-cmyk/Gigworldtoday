import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published: boolean;
  published_at: string | null;
};

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  // 1) Load category
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .single();

  if (!category) return notFound();

  // 2) Load articles that are linked to this category (inner join)
  const { data: articlesData } = await supabase
    .from("articles")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published,
      published_at,
      article_categories!inner (
        category_id
      )
    `
    )
    .eq("published", true)
    .eq("article_categories.category_id", category.id)
    .order("published_at", { ascending: false });

  const articles = (articlesData ?? []) as Article[];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Improved Category Header */}
      <div className="relative mt-8 mb-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50 to-white rounded-2xl" />
        <div className="px-10 py-14 rounded-2xl border border-neutral-200">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
            Category
          </p>
          <h2 className="text-4xl font-semibold tracking-tight">
            {category.name}
          </h2>
          <p className="mt-5 text-neutral-600 max-w-2xl leading-relaxed">
            Curated coverage and analysis focused on {category.name.toLowerCase()} within the gig economy.
          </p>
        </div>
      </div>

      {/* Improved Empty State */}
      {articles.length === 0 ? (
        <div className="mt-10 p-10 rounded-xl border border-neutral-200 bg-neutral-50">
          <p className="text-neutral-700 font-medium">
            No articles have been published in this category yet.
          </p>
          <p className="mt-3 text-neutral-500">
            Coverage will appear here as new insights are published.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {articles.map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="block group">
              <div className="border-b border-neutral-200 pb-10">
                <h3 className="text-2xl font-semibold tracking-tight group-hover:underline">
                  {a.title}
                </h3>
                {a.excerpt && (
                  <p className="mt-4 text-neutral-600 leading-relaxed max-w-2xl">
                    {a.excerpt}
                  </p>
                )}
                {a.published_at && (
                  <p className="mt-4 text-sm text-neutral-500">
                    {new Date(a.published_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
