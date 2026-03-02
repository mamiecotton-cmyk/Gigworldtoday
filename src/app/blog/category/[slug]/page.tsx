import Link from "next/link";
import { createServerSupabase } from "@/lib/supabaseServer";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServerSupabase();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image, show_featured_on_list, published_at")
    .eq("published", true)
    .is("deleted_at", null)
    .contains("tags", [slug])
    .order("published_at", { ascending: false });

  const categoryName = slug.replace(/-/g, " ");

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10">
        <h1 className="text-3xl font-bold capitalize mb-8">{categoryName}</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.length ? (
            articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-neutral-100"
              >
                {article.featured_image && article.show_featured_on_list !== false && (
                  <div className="w-full overflow-hidden">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-auto max-h-[220px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:underline">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-neutral-500">
                    {article.published_at &&
                      new Date(article.published_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-3">No articles found in this category.</p>
          )}
        </div>
      </div>
    </main>
  );
}