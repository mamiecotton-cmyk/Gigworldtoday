import ArticleRenderer from "@/components/ArticleRenderer";
import { supabase } from "@/lib/supabaseClient";

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from("articles")
    .select("title, slug, excerpt, featured_image, content, content_json, content_version, published_at")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!article) {
    return <div className="p-6">Not found</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{article.title}</h1>

      {article.featured_image ? (
        <img
          src={article.featured_image}
          alt=""
          className="mt-4 w-full rounded-xl"
        />
      ) : null}

      <div className="mt-8">
        <ArticleRenderer
          contentJson={article.content_json}
          legacyHtml={article.content}
        />
      </div>
    </main>
  );
}