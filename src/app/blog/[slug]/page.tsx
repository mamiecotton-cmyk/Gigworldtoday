export const dynamic = "force-dynamic";
export const revalidate = 0;

import ArticleRenderer from "@/components/ArticleRenderer";
import { createServerSupabase } from "@/lib/supabaseServer";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createServerSupabase();

  const { data: article } = await supabase
    .from("articles")
    .select(`
      id,
      slug,
      title,
      featured_image,
      content_json,
      published,
      deleted_at
    `)
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!article) {
    return <div className="p-6">Not found</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-4xl font-bold mb-6">
        {article.title}
      </h1>

      {article.featured_image && (
        <img
          src={article.featured_image}
          alt=""
          className="w-full rounded-xl mb-8"
        />
      )}

      <ArticleRenderer contentJson={article.content_json} />
    </main>
  );
}