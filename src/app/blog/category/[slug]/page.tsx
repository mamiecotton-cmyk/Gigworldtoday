import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabaseServer";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage(
  { params }: { params: { slug: string } }
) {
  const supabase = createServerSupabase();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, published_at")
    .eq("published", true)
    .is("deleted_at", null)
    .contains("tags", [params.slug])
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">
        Category: {params.slug}
      </h1>

      <div className="space-y-4">
        {articles?.length ? (
          articles.map(article => (
            <div key={article.id} className="border p-4 rounded-lg">
              <Link
                href={`/blog/${article.slug}`}
                className="text-xl font-semibold hover:underline"
              >
                {article.title}
              </Link>
            </div>
          ))
        ) : (
          <p>No articles found.</p>
        )}
      </div>
    </main>
  );
}
