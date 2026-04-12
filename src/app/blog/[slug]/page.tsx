export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import ArticleRenderer from "@/components/ArticleRenderer";
import ArticleComments from "@/components/ArticleComments";
import SignupBanner from "@/components/SignupBanner";
import platformsData from "@/data/platforms.json";
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

  const inactiveStatuses = [
    "absorbed",
    "merged",
    "rebranded",
    "shut_down",
    "shutdown",
    "permanently_closed",
    "no_longer_hiring",
    "closed",
    "inactive",
    "defunct",
    "acquired",
    "out_of_business",
  ];
  const activePlatforms = (platformsData as any[]).filter(
    (p) => !inactiveStatuses.includes((p.driverStatus || "").toLowerCase())
  );
  const relatedPlatforms = activePlatforms
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

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

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Gig Platforms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedPlatforms.map((p: any) => (
            <Link
              key={p.slug}
              href={`/platforms/${p.slug}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-teal-400 hover:shadow-md transition bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-teal-600">{p.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.estimatedHourlyMin && p.estimatedHourlyMax
                    ? `$${p.estimatedHourlyMin}–$${p.estimatedHourlyMax}/hr`
                    : "View details"}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/platforms" className="text-sm text-teal-600 hover:underline font-semibold">
            Browse All Platforms →
          </Link>
        </div>
      </div>
        </div>
      </main>
  );
}
