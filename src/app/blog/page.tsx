export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabaseServer";
import SignupBanner from "@/components/SignupBanner";
import TrackedLink from "@/components/TrackedLink";
import AmazonProductCard from "@/components/AmazonProductCard";

export default async function Page() {
  const amazonEmbedHtml = `
    <a
      href="https://www.amazon.com/s?k=folding+wagon+cart"
      target="_blank"
      rel="noopener noreferrer sponsored"
      class="block"
    >
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
        <img
          src="/wagon.jpg"
          alt="Folding utility wagon"
          style="width:96px;height:96px;border-radius:0.75rem;object-fit:cover;"
        />
        <div style="flex:1;min-width:200px;">
          <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">
            Amazon Pick
          </p>
          <h3 style="margin:0 0 0.5rem;font-size:1.125rem;color:#0f172a;">
            Folding Utility Wagon
          </h3>
          <p style="margin:0;color:#475569;line-height:1.6;">
            A collapsible wagon makes bulky grocery, catering, and apartment deliveries easier to handle with fewer trips and less strain.
          </p>
        </div>
      </div>
    </a>
  `;

  const supabase = createServerSupabase();
  const { data: articlesData } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false });
  const articles = articlesData ?? [];
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-transparent">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-3 md:pt-8 md:pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Left — Primary Content */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-800 mb-3">
                Gig Economy Intelligence
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight whitespace-nowrap">
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

            {/* Right — Book Authority Panel */}
            <div className="flex flex-col items-center mt-4 md:mt-0">
              {/* 3D Book Mockup */}
              <div
                className="group"
                style={{ perspective: '1200px' }}
              >
                <div
                  className="relative transition-transform duration-500 ease-out group-hover:[transform:rotateY(-8deg)]"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(-15deg)',
                  }}
                >
                  {/* Front Cover */}
                  <Image
                    src="/5star-book-cover.png"
                    alt="The 5-Star Gig Worker book cover"
                    width={276}
                    height={368}
                    className="relative z-10 w-auto h-[210px] md:h-[280px] object-contain rounded-r-md rounded-l-sm"
                    style={{ backfaceVisibility: 'hidden' }}
                    priority
                  />
                  {/* Spine */}
                  <div
                    className="absolute top-0 left-0 h-full w-[30px] md:w-[36px] rounded-l-md"
                    style={{
                      transform: 'rotateY(-90deg) translateX(-15px)',
                      transformOrigin: 'left center',
                      background: 'linear-gradient(to right, #1e3a5f, #234a72, #1e3a5f)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                  {/* Page Edges (right side) */}
                  <div
                    className="absolute top-[3px] right-[-8px] h-[calc(100%-6px)] w-[10px] rounded-r-sm"
                    style={{
                      background: 'linear-gradient(to right, #e8e4df, #f5f2ed, #e8e4df)',
                      transform: 'translateZ(-2px)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                  {/* Bottom shadow */}
                  <div
                    className="absolute -bottom-4 left-4 right-0 h-6 rounded-full opacity-30 blur-md bg-black"
                    style={{ transform: 'translateZ(-10px)' }}
                  />
                </div>
              </div>
              <div className="mt-5 text-center">
                <p className="text-sm text-slate-700">Built on the principles of</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">The 5-Star Gig Worker</p>
                <TrackedLink
                  href="https://www.amazon.com/5-Star-Gig-Worker-Mastering-Platforms-ebook/dp/B0GHZLV2XG/ref=tmm_kin_swatch_0?_encoding=UTF8&dib_tag=se&dib=eyJ2IjoiMSJ9.xaugsy5c4sq1EDfwPTvGx6kDf-0n7CpY8F348ZF0w-WuAC5ANBntrzpQwKsZmDmHz3ynizzACMJ-1KB8GYwdM18QvwbGlFyD3zpJRiOtw08.CzdZV_waCiqyYKeNCK1JhcQMy18RtpbTBjO2TI8r-Ck&qid=1772078784&sr=8-1"
                  linkType="book"
                  label="The 5 Star Gig Worker"
                  sourcePage="blog"
                  className="inline-block mt-1 text-sm text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition"
                >
                  View on Amazon →
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
      {/* Category Navigation */}
      <div className="flex flex-wrap gap-6 mt-8 mb-10 border-b border-neutral-200 pb-4">
        <Link
          href="/blog"
          className="text-sm text-neutral-800 hover:text-black transition"
        >
          All
        </Link>
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className="text-sm text-neutral-800 hover:text-black transition"
          >
            {category.name}
          </Link>
        ))}
      </div>
      {/* Article Grid */}
      <div id="articles" className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
            {articles.slice(0, 3).map((article, index) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-neutral-100"
          >
            {article.featured_image && article.show_featured_on_list !== false && (
              <div className="relative h-[220px] w-full overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:underline">
                {article.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-700 line-clamp-3">
                {article.excerpt}
              </p>
              <p className="mt-4 text-xs text-neutral-600">
                {article.published_at &&
                  new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}

        {/* Amazon Product Pick — full-width break after article 3 */}
        {(
          <div className="md:col-span-2 lg:col-span-3">
            <a
              href="https://www.amazon.com/TIMBER-RIDGE-Extended-Collapsible-Adjustable/dp/B0C2C56L8G?tag=gigworldtoday-20"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-6 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition p-5"
            >
              <img
                src="/wagon.jpg"
                alt="Heavy Duty Folding Wagon for delivery drivers"
                className="w-24 h-24 object-contain rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">GigSideKick Pick</p>
                <h3 className="text-base font-bold text-neutral-900">Heavy Duty Folding Wagon</h3>
                <p className="text-sm text-neutral-600 mt-1">Carry more in one trip — a must-have for grocery and bulk delivery drivers.</p>
              </div>
              <span className="flex-shrink-0 bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap">
                View on Amazon →
              </span>
            </a>
            <p className="text-xs text-gray-400 mt-1 text-right">*As an Amazon Associate I earn from qualifying purchases.</p>
          </div>
        )}

        {articles.slice(3).map((article, index) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-neutral-100"
          >
            {article.featured_image && article.show_featured_on_list !== false && (
              <div className="relative h-[220px] w-full overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:underline">
                {article.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-700 line-clamp-3">
                {article.excerpt}
              </p>
              <p className="mt-4 text-xs text-neutral-600">
                {article.published_at &&
                  new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
