export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabaseServer";
import SignupBanner from "@/components/SignupBanner";

// ── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Gig Economy Blog | GigWorldToday",
  description:
    "Platform updates, earnings breakdowns, and practical insights for gig workers — DoorDash, Instacart, Uber Eats, Spark, and more.",
  alternates: { canonical: "https://www.gigworldtoday.com/blog" },
  openGraph: {
    title: "Gig Economy Blog | GigWorldToday",
    description:
      "Real strategy for serious gig workers. Platform updates, earnings breakdowns, and practical insights.",
    url: "https://www.gigworldtoday.com/blog",
    siteName: "GigWorldToday",
    type: "website",
    images: [
      {
        url: "https://www.gigworldtoday.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GigWorldToday Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gig Economy Blog | GigWorldToday",
    description: "Real strategy for serious gig workers.",
    images: ["https://www.gigworldtoday.com/og-image.png"],
  },
};

// ── JSON-LD structured data ──────────────────────────────────────────────────
function BlogJsonLd({ articles }: { articles: Article[] }) {
  const itemList = articles.slice(0, 10).map((a, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `https://www.gigworldtoday.com/blog/${a.slug}`,
    name: a.title,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.gigworldtoday.com" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.gigworldtoday.com/blog" },
        ],
      },
      {
        "@type": "Blog",
        name: "GigWorldToday Blog",
        url: "https://www.gigworldtoday.com/blog",
        description: "Platform updates, earnings breakdowns, and practical insights for gig workers.",
        publisher: {
          "@type": "Organization",
          name: "GigWorldToday",
          url: "https://www.gigworldtoday.com",
          logo: { "@type": "ImageObject", url: "https://www.gigworldtoday.com/GigWorldLogoMain.png" },
        },
        blogPost: itemList,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  show_featured_on_list: boolean | null;
  published_at: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPage() {
  const supabase = createServerSupabase();

  // Only fetch columns actually used — avoids pulling content_json etc.
  const { data: articlesData } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, featured_image, show_featured_on_list, published_at")
    .eq("published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  const articles: Article[] = articlesData ?? [];

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categories: Category[] = categoriesData ?? [];

  return (
    <>
      <BlogJsonLd articles={articles} />

      <div className="min-h-screen">
        {/* ── Hero ── */}
        <section aria-labelledby="blog-heading">
          <div className="max-w-6xl mx-auto px-6 pt-6 pb-3 md:pt-8 md:pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

              {/* Left — Primary Content */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#0f3460] mb-3">
                  Gig Economy Intelligence
                </p>
                <h1
                  id="blog-heading"
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight"
                >
                  Real Strategy for Serious Gig Workers
                </h1>
                <p className="mt-4 text-sm md:text-base text-slate-700 max-w-md leading-relaxed">
                  Platform updates, earnings breakdowns, and practical insights built from real-world experience.
                </p>
                <Link
                  href="#articles"
                  className="inline-flex items-center mt-5 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 transition shadow"
                >
                  Explore Latest Articles
                </Link>
                <div className="mt-8 max-w-xs">
                  <SignupBanner
                    headline="Get weekly tips"
                    subtext="Early platform updates & strategy."
                    buttonText="Subscribe"
                    variant="inline"
                  />
                </div>
              </div>

              {/* Right — Book */}
              <div className="flex flex-col items-center mt-4 md:mt-0">
                <div className="group" style={{ perspective: "1200px" }}>
                  <div
                    className="relative transition-transform duration-500 ease-out group-hover:[transform:rotateY(-8deg)]"
                    style={{ transformStyle: "preserve-3d", transform: "rotateY(-15deg)" }}
                  >
                    <Image
                      src="/5star-book-cover.png"
                      alt="The 5-Star Gig Worker book by Mamie Cotton — cover"
                      width={276}
                      height={368}
                      className="relative z-10 w-auto h-[210px] md:h-[280px] object-contain rounded-r-md rounded-l-sm"
                      style={{ backfaceVisibility: "hidden" }}
                      priority
                    />
                    <div
                      className="absolute top-0 left-0 h-full w-[30px] md:w-[36px] rounded-l-md"
                      style={{
                        transform: "rotateY(-90deg) translateX(-15px)",
                        transformOrigin: "left center",
                        background: "linear-gradient(to right, #1e3a5f, #234a72, #1e3a5f)",
                        backfaceVisibility: "hidden",
                      }}
                    />
                  </div>
                </div>
                <Link
                  href="/products/how-to-be-a-5-star-gig-worker"
                  className="mt-4 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition shadow"
                  aria-label="Get The 5-Star Gig Worker book"
                >
                  Get the Book →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Category Nav ── */}
        <nav aria-label="Blog categories" className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/blog"
              className="text-sm font-medium text-neutral-800 hover:text-teal-600 transition"
              aria-current="page"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="text-sm text-neutral-700 hover:text-teal-600 transition"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* ── Article Grid ── */}
        <main className="max-w-6xl mx-auto px-6">
          <div
            id="articles"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20"
          >
            {articles.map((article, index) => {
              const showImage =
                article.featured_image && article.show_featured_on_list !== false;

              return (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-neutral-100 flex flex-col"
                  aria-label={`Read article: ${article.title}`}
                >
                  {showImage && (
                    /* aspect-ratio container prevents CLS — no fixed height */
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-100">
                      <Image
                        src={article.featured_image!}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        /* prioritize first 3 images for LCP */
                        priority={index < 3}
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-lg font-semibold text-neutral-900 group-hover:underline leading-snug">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-3 text-sm text-neutral-700 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                    )}
                    <time
                      dateTime={article.published_at ?? undefined}
                      className="mt-4 text-xs text-neutral-500 block"
                    >
                      {article.published_at &&
                        new Date(article.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </time>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
