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
    .select("title, excerpt, tags, featured_image, published_at, updated_at, seo_title, seo_description")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!article) {
    return {
      title: "Blog Article",
    };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || undefined;
  const image = article.featured_image || "https://www.gigworldtoday.com/og-image.png";

  return {
    title,
    description,
    keywords: Array.isArray(article.tags) ? article.tags : undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${slug}`,
      siteName: "GigWorldToday",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
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
      video_url,
      tags,
      published,
      published_at,
      updated_at,
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

  const articleUrl = `https://www.gigworldtoday.com/blog/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.featured_image ? [article.featured_image] : undefined,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    author: {
      "@type": "Person",
      name: "Mamie",
      url: "https://www.gigworldtoday.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "GigWorldToday",
      logo: {
        "@type": "ImageObject",
        url: "https://www.gigworldtoday.com/GigWorldLogoMain.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-5 md:p-10">
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

      {article.video_url && (() => {
        const url = article.video_url;
        const isShort = url.includes('/shorts/');
        const videoId = isShort
          ? url.split('/shorts/')[1]?.split(/[?&]/)[0]
          : url.includes('youtu.be/')
            ? url.split('youtu.be/')[1]?.split(/[?&]/)[0]
            : url.includes('v=')
              ? url.split('v=')[1]?.split(/[?&]/)[0]
              : null;
        if (!videoId) return null;
        return (
          <div className={`mb-8 ${isShort ? 'flex flex-col items-center' : ''}`}>
            <div className="bg-gray-900 rounded-xl overflow-hidden" style={isShort ? { width: 280, height: 498 } : { width: '100%', aspectRatio: '16/9' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Video version of this article"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
              <p className="text-xs text-gray-500">📹 Watch the video version</p>
              <a
                href="https://www.youtube.com/channel/UCnvYW8_sApy-_TKaBqDfbmQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Subscribe on YouTube
              </a>
            </div>
          </div>
        );
      })()}

      <ArticleRenderer contentJson={article.content_json} />

      {/* Upside Affiliate Ad */}
      <div className="my-6 p-4 rounded-xl border border-teal-100 bg-teal-50/50 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sponsored</p>
        <h3 id="3887861">
          <a
            rel="sponsored"
            href="https://upside.sjv.io/c/7066741/3887861/39811?param1=gigworld25"
            className="text-teal-700 font-semibold hover:underline"
          >
            Download the free Upside app — earn Extra 25¢/gal on gas
          </a>
        </h3>
        <img
          height="0"
          width="0"
          src="https://imp.pxf.io/i/7066741/3887861/39811"
          style={{ position: "absolute", visibility: "hidden", border: 0 }}
        />
      </div>

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
