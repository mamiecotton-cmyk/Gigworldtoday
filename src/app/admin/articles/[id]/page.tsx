import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
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
    .select("id, title, slug, excerpt, content_json, content_version, published")
    .eq("id", id)
    .single();

  if (!article) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-10">
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
      />

      <DeleteArticleButton id={article.id} />
    </div>
  );
}