export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import ArticleRenderer from "@/components/ArticleRenderer";
import ArticleComments from "@/components/ArticleComments";
import SignupBanner from "@/components/SignupBanner";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabase();

  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, tags")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!article) {
    return {
      title: "Blog Article",
    };
  }

  return {
    title: article.title,
    description: article.excerpt || undefined,
    keywords: Array.isArray(article.tags) ? article.tags : undefined,
  };
}

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
      excerpt,
      featured_image,
      show_featured_on_detail,
      content_json,
      tags,
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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10">
      <h1 className="text-4xl font-bold mb-6">
        {article.title}
      </h1>

      {article.featured_image && article.show_featured_on_detail !== false && (
        <div className="max-h-[400px] overflow-hidden rounded-xl mb-8">
          <img
            src={article.featured_image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <ArticleRenderer contentJson={article.content_json} />

      <SignupBanner
        headline="Want More Weekly Operator Tips?"
        subtext="Get strategies to boost earnings delivered to your inbox."
        buttonText="Get Weekly Strategy"
        variant="compact"
      />

      <ArticleComments articleId={article.id} />
        </div>
      </main>
  );
}
