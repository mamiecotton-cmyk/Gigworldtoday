import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleForm from "@/components/ArticleForm";
import DeleteArticleButton from "./DeleteArticleButton";

export default async function EditArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, content_json, content_version, published, featured_image, tags")
    .eq("id", id)
    .single();

  if (!article) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        ← Back to Articles
      </Link>
      <h1 className="text-2xl font-semibold mb-6">
        Edit Article
      </h1>

      <ArticleForm
        initialContent={article.content_json || []}
        articleId={article.id}
        initialTitle={article.title}
        initialSlug={article.slug}
        initialExcerpt={article.excerpt}
        initialPublished={article.published}
        initialFeaturedImage={article.featured_image}
        initialTags={article.tags || []}
      />

      <DeleteArticleButton id={article.id} />
    </div>
  );
}