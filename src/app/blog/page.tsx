import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabaseServer";
import SignupBanner from "@/components/SignupBanner";

export default async function Page() {
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
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left — Primary Content */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Gig Economy Intelligence
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                Real Strategy for Serious Gig Workers
              </h1>
              <p className="mt-3 text-base md:text-lg text-slate-600 max-w-md leading-relaxed">
                Platform updates, earnings breakdowns, and practical insights built from real-world experience.
              </p>
              <Link
                href="#articles"
                className="inline-flex items-center mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 transition shadow"
              >
                Explore Latest Articles
              </Link>
              <div className="mt-6 max-w-sm">
                <SignupBanner
                  headline="Get weekly tips"
                  subtext="Early platform updates & strategy."
                  buttonText="Subscribe"
                  variant="inline"
                />
              </div>
            </div>

            {/* Right — Book Authority Panel */}
            <div className="flex flex-col items-center mt-10 md:mt-4">
              <Image
                src="/5star-book-cover.png"
                alt="The 5-Star Gig Worker book cover"
                width={276}
                height={368}
                className="w-auto h-[230px] md:h-[300px] object-contain rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-shadow duration-300"
                priority
              />
              <div className="mt-3 text-center">
                <p className="text-sm text-slate-500">Built on the principles of</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">The 5-Star Gig Worker</p>
                <a
                  href="https://www.amazon.com/5-Star-Gig-Worker-Mastering-Platforms-ebook/dp/B0GHZLV2XG/ref=monarch_sidesheet_title"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-sm text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition"
                >
                  View on Amazon →
                </a>
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
          className="text-sm text-neutral-700 hover:text-black transition"
        >
          All
        </Link>
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className="text-sm text-neutral-700 hover:text-black transition"
          >
            {category.name}
          </Link>
        ))}
      </div>
      {/* Article Grid */}
      <div id="articles" className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
            {articles.map((article) => (
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
              <p className="mt-3 text-sm text-neutral-600 line-clamp-3">
                {article.excerpt}
              </p>
              <p className="mt-4 text-xs text-neutral-500">
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