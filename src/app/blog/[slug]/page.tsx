import DiscussionSection from "@/components/DiscussionSection";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch article
  const { data: article } = await supabase
    .from("articles")
    .select(`
      *,
      article_categories (
        categories ( name, slug )
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (!article) return <div>Article not found</div>;

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      profiles ( full_name )
    `)
    .eq("article_id", article.id)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return (
    <article className="max-w-3xl mx-auto px-6 py-20">
      {/* Article Title */}
      <h1 className="text-4xl font-semibold tracking-tight mb-6">
        {article.title}
      </h1>

      {/* Category Badges */}
      {article.article_categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.article_categories.map((ac: any) => (
            <Link
              href={`/blog/category/${ac.categories.slug}`}
              key={ac.categories.slug}
              className="text-xs uppercase tracking-wide border px-3 py-1 rounded-full text-neutral-600 hover:bg-neutral-100 transition"
            >
              {ac.categories.name}
            </Link>
          ))}
        </div>
      )}

      {/* Article Body */}
      <div
        className="prose prose-neutral max-w-2xl mx-auto"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Discussion Section */}
      <DiscussionSection
        articleId={article.id}
        comments={comments ?? []}
      />
    </article>
  );
}